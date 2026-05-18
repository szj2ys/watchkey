import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = (await params).id

  try {
    const analysisId = requestId

    const supabase = await createClient()

    // Fetch analysis with video details
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select(`
        id,
        status,
        error,
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

    // Guard against null analysis (should not happen if no error)
    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found', requestId: analysisId },
        { status: 404 }
      )
    }

    // Use Object.assign to avoid spread type issues
    const response = Object.assign({}, analysis, { requestId: analysisId })
    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/analyses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    )
  }
}
