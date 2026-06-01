import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const requestId = (await params).id

  try {
    const videoId = requestId
    const supabase = await createClient()

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

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found', requestId: videoId },
        { status: 404 }
      )
    }

    if (video.analyses && video.analyses.length > 0) {
      video.analyses.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    const response = Object.assign({}, video, { requestId: videoId })
    return NextResponse.json(response, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in GET /api/videos/[id]:', error)
    return NextResponse.json(
      { error: message, requestId },
      { status: 500 }
    )
  }
}
