import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeId, isValidYouTubeUrl } from '@/lib/youtube/parser'
import { getYouTubeVideoDetails } from '@/lib/youtube/service'
import { inngest } from '@/lib/inngest/client'
import { randomUUID } from 'crypto'

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

    // Send Inngest event for async processing
    await inngest.send({
      name: 'analysis.requested',
      data: {
        analysisId: analysisData.id,
        videoId,
        duration: video_duration,
      },
    })

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
