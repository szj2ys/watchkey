import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeId, isValidYouTubeUrl } from '@/lib/youtube/parser'
import { getYouTubeVideoDetails, fetchYouTubeTranscript } from '@/lib/youtube/service'
import { AIService } from '@/lib/ai/service'
import { randomUUID } from 'crypto'
import type { Chapter } from '@/lib/ai/provider'
import { PROGRESS_PCT } from '@/lib/progress'

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
    await supabase.from('analyses').update({ status: 'processing', progress_stage: 'transcript', progress_pct: PROGRESS_PCT.transcript }).eq('id', analysisId)

    const transcriptEntries = await fetchYouTubeTranscript(videoId) || []
    const plainText = transcriptEntries.map((e) => e.text).join(' ')

    await supabase.from('analyses').update({ progress_stage: 'chapters', progress_pct: PROGRESS_PCT.chapters }).eq('id', analysisId)

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

      await supabase.from('analyses').update({ progress_stage: 'summary', progress_pct: PROGRESS_PCT.summary }).eq('id', analysisId)

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
      progress_stage: 'completed',
      progress_pct: PROGRESS_PCT.completed,
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
    } else {
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
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!videoData) throw new Error('Failed to create video record')
      video_uuid = videoData.id
    }

    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({ video_id: video_uuid, status: 'pending' })
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
