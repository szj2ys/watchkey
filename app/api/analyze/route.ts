import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractYouTubeId, isValidYouTubeUrl } from '@/lib/youtube/parser'
import { getYouTubeVideoDetails } from '@/lib/youtube/service'
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
      .select('id')
      .eq('youtube_id', videoId)
      .single()

    let video_uuid: string

    if (existingVideo) {
      video_uuid = existingVideo.id
    } else {
      // Fetch video details from YouTube
      const videoDetails = await getYouTubeVideoDetails(videoId)

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

    // TODO: Trigger background worker to process the analysis
    // For now, we just return the analysis ID

    return NextResponse.json(
      { analysis_id: analysisData.id, requestId },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error in POST /api/analyze:', error)
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    )
  }
}
