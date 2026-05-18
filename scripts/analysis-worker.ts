/**
 * Analysis Worker
 * Polls for pending analyses and processes them.
 */

import { createClient } from '@/lib/supabase/server'
import { AIService } from '@/lib/ai/service'
import { getYouTubeVideoDetails } from '@/lib/youtube/service'
import { TranscriptEntry } from '@/lib/ai/provider'

// Mock transcript fetching - in a real app, we would fetch the actual transcript
async function fetchMockTranscript(videoId: string): Promise<string> {
  // For now, return a mock transcript
  return `This is a mock transcript for video ${videoId}. It contains several sentences that we can use to test the analysis pipeline.`;
}

// Process a single analysis
async function processAnalysis(analysisId: string) {
  const supabase = await createClient()
  const aiService = new AIService()

  // Fetch analysis with video details
  const { data: analysis, error: fetchError } = await supabase
    .from('analyses')
    .select(`
      id,
      video_id,
      videos (
        youtube_id,
        title,
        duration
      )
    `)
    .eq('id', analysisId)
    .single()

  if (fetchError) {
    console.error(`Error fetching analysis ${analysisId}:`, fetchError)
    return
  }

  if (!analysis) {
    console.error(`Analysis ${analysisId} not found`)
    return
  }

  const video = analysis.videos
  if (!video) {
    console.error(`Video not found for analysis ${analysisId}`)
    return
  }

  try {
    // Update status to processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId)

    // Fetch transcript (mock for now)
    const rawTranscript = await fetchMockTranscript(video.youtube_id)

    // Enhance transcript with AI
    const enhancedTranscript = await aiService.enhanceTranscript(rawTranscript)

    // Generate chapters
    const chapters = await aiService.generateChapters(
      rawTranscript,
      video.duration || 0
    )

    // Generate summary
    const summary = await aiService.generateSummary(rawTranscript)

    // Update analysis with results
    const { error: updateError } = await supabase
      .from('analyses')
      .update({
        status: 'completed',
        chapters: JSON.stringify(chapters),
        summary,
        transcript: JSON.stringify(enhancedTranscript),
      })
      .eq('id', analysisId)

    if (updateError) {
      throw updateError
    }

    console.log(`Successfully processed analysis ${analysisId}`)
  } catch (error: any) {
    console.error(`Error processing analysis ${analysisId}:`, error)

    // Update analysis with failed status
    await supabase
      .from('analyses')
      .update({
        status: 'failed',
        error: error.message || 'Unknown error',
      })
      .eq('id', analysisId)
  }
}

// Main worker loop
async function worker() {
  console.log('Analysis worker started')

  while (true) {
    try {
      const supabase = await createClient()

      // Fetch one pending analysis
      const { data: analyses, error } = await supabase
        .from('analyses')
        .select('id')
        .eq('status', 'pending')
        .limit(1)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching pending analyses:', error)
        await new Promise(resolve => setTimeout(resolve, 10000))
        continue
      }

      if (analyses.length === 0) {
        // No pending analyses, wait before polling again
        await new Promise(resolve => setTimeout(resolve, 10000))
        continue
      }

      const analysisId = analyses[0].id
      console.log(`Found pending analysis ${analysisId}, processing...`)

      // Process the analysis
      await processAnalysis(analysisId)
    } catch (error) {
      console.error('Unexpected error in worker loop:', error)
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }
}

// Start the worker
worker().catch((error) => {
  console.error('Fatal error in worker:', error)
  process.exit(1)
})
