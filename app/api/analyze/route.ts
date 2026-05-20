import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeId, isValidYouTubeUrl } from '@/lib/youtube/parser'
import { getYouTubeVideoDetails, fetchYouTubeTranscript } from '@/lib/youtube/service'
import { AIService } from '@/lib/ai/service'
import { randomUUID } from 'crypto'

async function processAnalysisInline(
  supabase: any,
  analysisId: string,
  videoId: string,
  duration: number
) {
  try {
    // Update status to processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId)

    // Fetch real transcript from YouTube (returns array of {text, startTime})
    const transcriptEntries = await fetchYouTubeTranscript(videoId)
    
    let chapters: string[] = []
    let summary: string | null = null

    // Try to use AI service for chapters and summary
    try {
      const aiService = new AIService()
      const plainText = transcriptEntries.map(e => e.text).join(' ')
      
      // Generate chapters from transcript
      const chapterData = await aiService.generateChapters(plainText, duration)
      chapters = chapterData.map((ch: { startTime: number; title: string }) => {
        const minutes = Math.floor(ch.startTime / 60)
        const seconds = Math.floor(ch.startTime % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')} ${ch.title}`
      })
      
      // Generate summary from transcript
      summary = await aiService.generateSummary(plainText)
    } catch (aiError: any) {
      console.warn(`[analyze] AI service failed for analysis ${analysisId}:`, aiError.message)
      // AI failed, but we still have the real transcript - that's fine
    }

    // Use transcript entries directly (already have startTime)
    const enhancedTranscript = transcriptEntries.map(entry => ({
      text: entry.text,
      startTime: entry.startTime,
      confidence: 0.95
    }))

    // Update analysis with results
    const { error: updateError } = await supabase
      .from('analyses')
      .update({
        status: 'completed',
        chapters: chapters,
        summary: summary,
        transcript: enhancedTranscript,
      })
      .eq('id', analysisId)

    if (updateError) {
      throw updateError
    }

    console.log(`[analyze] Inline processing completed for analysis ${analysisId}`)
  } catch (error: any) {
    console.error(`[analyze] Error processing analysis ${analysisId}:`, error)
    
    await supabase
      .from('analyses')
      .update({
        status: 'failed',
        error: error.message || 'Unknown error during inline processing',
      })
      .eq('id', analysisId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()

  try {
    const { youtubeUrl } = await request.json()

    // Validate YouTube URL
    if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL', requestId },
        { status: 400 }
      )
    }

    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL', requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if video already exists
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id, duration')
      .eq('youtube_id', videoId)
      .single()

    let video_uuid: string
    let video_duration: number = 300 // default 5 minutes

    if (existingVideo) {
      video_uuid = existingVideo.id
      video_duration = existingVideo.duration || 300
    } else {
      // Fetch video details from YouTube
      const videoDetails = await getYouTubeVideoDetails(videoId)
      video_duration = videoDetails.duration || 300

      // Insert new video
      const { data: videoData, error: insertVideoError } = await supabase
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

      if (insertVideoError) throw insertVideoError
      if (!videoData) throw new Error('Failed to create video record')
      video_uuid = videoData.id
    }

    // Create analysis record
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        video_id: video_uuid,
        status: 'pending',
      })
      .select('id')
      .single()

    if (analysisError) throw analysisError
    if (!analysisData) throw new Error('Failed to create analysis record')

    // Process analysis inline with real data (non-blocking)
    // Fire and forget - client will poll for status
    processAnalysisInline(supabase, analysisData.id, videoId, video_duration)
      .catch(err => console.error('[analyze] Inline processing failed:', err))

    return NextResponse.json(
      { analysis_id: analysisData.id, requestId },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error in POST /api/analyze:', error)
    const errorMessage = error instanceof Error
      ? error.message
      : (error && typeof error === 'object' && 'message' in error)
        ? String((error as any).message)
        : JSON.stringify(error)
    // Provide more helpful error for configuration issues
    if (
      errorMessage.includes('Missing Supabase environment variables') ||
      errorMessage.includes('placeholder values') ||
      errorMessage.includes('Invalid supabaseUrl')
    ) {
      return NextResponse.json(
        { error: 'Service not configured. Please set up your Supabase credentials in .env.local', requestId },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: errorMessage, requestId },
      { status: 500 }
    )
  }
}
