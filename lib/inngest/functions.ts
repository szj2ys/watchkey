import { inngest } from './client'
import { createClient } from '@supabase/supabase-js'
import { AIService } from '@/lib/ai/service'
import { fetchYouTubeTranscript } from '@/lib/youtube/service'

export const processAnalysis = inngest.createFunction(
  {
    id: 'process-analysis',
    retries: 3,
    triggers: { event: 'analysis.requested' },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { analysisId, videoId, duration } = event.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables for background processing')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Step 1: Mark as processing
    await step.run('mark-processing', async () => {
      const { error } = await supabase
        .from('analyses')
        .update({ status: 'processing' })
        .eq('id', analysisId)

      if (error) throw error
    })

    // Step 2: Fetch transcript
    const transcriptEntries = await step.run('fetch-transcript', async () => {
      return fetchYouTubeTranscript(videoId)
    })

    // Step 3: AI analysis
    const analysisResult = await step.run('ai-analysis', async () => {
      const plainText = transcriptEntries.map((e: { text: string }) => e.text).join(' ')

      let chapters: string[] = []
      let summary: string | null = null

      try {
        const aiService = new AIService()
        const chapterData = await aiService.generateChapters(plainText, duration)
        chapters = chapterData.map((ch: { startTime: number; title: string }) => {
          const minutes = Math.floor(ch.startTime / 60)
          const seconds = Math.floor(ch.startTime % 60)
          return `${minutes}:${seconds.toString().padStart(2, '0')} ${ch.title}`
        })
        summary = await aiService.generateSummary(plainText)
      } catch (aiError: any) {
        console.warn(`[inngest] AI service failed for analysis ${analysisId}:`, aiError.message)
      }

      const enhancedTranscript = transcriptEntries.map((entry: { text: string; startTime: number }) => ({
        text: entry.text,
        startTime: entry.startTime,
        confidence: 0.95,
      }))

      return { chapters, summary, enhancedTranscript }
    })

    // Step 4: Save results
    await step.run('save-results', async () => {
      const { error } = await supabase
        .from('analyses')
        .update({
          status: 'completed',
          chapters: analysisResult.chapters,
          summary: analysisResult.summary,
          transcript: analysisResult.enhancedTranscript,
        })
        .eq('id', analysisId)

      if (error) throw error
    })

    return { analysisId, status: 'completed' }
  }
)
