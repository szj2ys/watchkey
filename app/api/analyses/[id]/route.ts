import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const requestId = (await params).id

  try {
    const analysisId = requestId
    const supabase = await createClient()

    const { data: analysis, error } = await supabase
      .from('analyses')
      .select(`
        id,
        status,
        error,
        progress_stage,
        progress_pct,
        chapters,
        summary,
        transcript,
        created_at,
        videos (
          id,
          youtube_id,
          title,
          channel,
          duration,
          thumbnail_url
        )
      `)
      .eq('id', analysisId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found', requestId: analysisId },
          { status: 404 }
        )
      }
      throw error
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found', requestId: analysisId },
        { status: 404 }
      )
    }

    const response = Object.assign({}, analysis, { requestId: analysisId })
    return NextResponse.json(response, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in GET /api/analyses/[id]:', error)
    return NextResponse.json(
      { error: message, requestId },
      { status: 500 }
    )
  }
}
