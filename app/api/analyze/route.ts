import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeId, isValidYouTubeUrl } from '@/lib/youtube/parser'
import { getYouTubeVideoDetails, fetchYouTubeTranscript } from '@/lib/youtube/service'
import { AIService } from '@/lib/ai/service'
import { randomUUID } from 'crypto'
import type { Chapter } from '@/lib/ai/provider'

interface TranscriptEntry {
  text: string;
  startTime: number;
  endTime?: number;
  confidence?: number;
}

interface ExistingAnalysis {
  id: string;
  status: string;
}

interface ExistingVideo {
  id: string;
  duration: number;
  analyses?: ExistingAnalysis[];
}

async function processAnalysisInBackground(analysisId: string, videoId: string, duration: number): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return

  const { createClient: createSupabase } = await import('@supabase/supabase-js')
  const supabase = createSupabase(supabaseUrl, supabaseAnonKey)

  try {
    await supabase.from('analyses').update({ status: 'processing' }).eq('id', analysisId)

    const transcriptEntries = await fetchYouTubeTranscript(videoId) || []
    const plainText = transcriptEntries.map((e) => e.text).join(' ')

    let chapters: Chapter[] = []
    let summary: string | null = null

    if (plainText.length > 50) {
      const aiService = new AIService()
      const chapterData = await aiService.generateChapters(plainText, duration)
      chapters = chapterData.map((ch) => ({
        startTime: Number(ch.startTime) || 0,
        endTime: Number(ch.endTime) || duration,
        title: String(ch.title || ''),
        summary: String(ch.summary || ''),
      }))

      summary = await aiService.generateSummary(plainText)
    }

    const enhancedTranscript: TranscriptEntry[] = transcriptEntries.map((e) => ({
      text: e.text,
      startTime: e.startTime || 0,
      endTime: (e.startTime || 0) + 5,
      confidence: 0.95,
    }))

    await supabase.from('analyses').update({
      status: 'completed',
      chapters,
      summary,
      transcript: enhancedTranscript,
    }).eq('id', analysisId)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[bg] analysis failed:', error)
    await supabase.from('analyses').update({ status: 'failed', error: message }).eq('id', analysisId)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID()

  try {
    const { youtubeUrl } = await request.json()

    if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json({ error: 'Invalid YouTube URL', requestId }, { status: 400 })
    }

    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'Could not extract video ID', requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Get authenticated user (if any)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id, duration, analyses(id, status)')
      .eq('youtube_id', videoId)
      .single()

    let video_uuid: string
    let video_duration = 300

    if (existingVideo) {
      const video = existingVideo as unknown as ExistingVideo;
      video_uuid = video.id
      video_duration = video.duration || 300
      const completedAnalysis = video.analyses?.find((a) => a.status === 'completed')
      if (completedAnalysis) {
        return NextResponse.json({ analysis_id: completedAnalysis.id, status: 'completed', requestId }, { status: 200 })
      }
      const existingAnalysis = video.analyses?.[0]
      if (existingAnalysis) {
        return NextResponse.json({ analysis_id: existingAnalysis.id, status: existingAnalysis.status, requestId }, { status: 200 })
      }
    }

    // Rate Limiting Enforcement for Authenticated Users
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('analysis_count, analysis_limit, updated_at')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      let count = profile.analysis_count
      const limit = profile.analysis_limit

      const profileDateStr = new Date(profile.updated_at).toISOString().split('T')[0]
      const currentDateStr = new Date().toISOString().split('T')[0]

      if (profileDateStr !== currentDateStr) {
        // Daily UTC Reset
        count = 0
      }

      if (count >= limit) {
        return NextResponse.json(
          { error: 'Daily limit reached. Please upgrade to continue.', requestId },
          { status: 429 }
        )
      }

      // Increment analysis count
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          analysis_count: count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError
    }

    if (!existingVideo) {
      const videoDetails = await getYouTubeVideoDetails(videoId)
      video_duration = videoDetails.duration || 300

      const { data: videoData, error: insertError } = await supabase
        .from('videos')
        .insert({
          youtube_id: videoId,
          title: videoDetails.title,
          channel: videoDetails.channel,
          duration: videoDetails.duration,
          thumbnail_url: videoDetails.thumbnailUrl,
          user_id: userId,
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!videoData) throw new Error('Failed to create video record')
      video_uuid = videoData.id
    } else {
      const video = existingVideo as unknown as ExistingVideo;
      video_uuid = video.id
    }

    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({ video_id: video_uuid, status: 'pending', user_id: userId })
      .select('id')
      .single()

    if (analysisError) throw analysisError
    if (!analysisData) throw new Error('Failed to create analysis record')

    const analysisId = analysisData.id

    processAnalysisInBackground(analysisId, videoId, video_duration).catch(console.error)

    return NextResponse.json({ analysis_id: analysisId, status: 'pending', requestId }, { status: 201 })

  } catch (error: unknown) {
    console.error('[analyze]', error)
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json({ error: msg, requestId }, { status: 500 })
  }
}
