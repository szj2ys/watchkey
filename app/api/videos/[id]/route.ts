import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = (await params).id

  try {
    const videoId = requestId

    const supabase = await createClient()

    // Fetch video with its latest analysis
    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        id,
        youtube_id,
        title,
        channel,
        duration,
        thumbnail_url,
        created_at,
        analyses (
          id,
          status,
          error,
          chapters,
          summary,
          transcript,
          created_at
        )
      `)
      .eq('id', videoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Video not found', requestId: videoId },
          { status: 404 }
        )
      }
      throw error
    }

    // Guard against null video (should not happen if no error)
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found', requestId: videoId },
        { status: 404 }
      )
    }

    // If there are analyses, sort by created_at descending to get the latest
    if (video.analyses && video.analyses.length > 0) {
      video.analyses.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    // Use Object.assign to avoid spread type issues
    const response = Object.assign({}, video, { requestId: videoId })
    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/videos/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    )
  }
}
