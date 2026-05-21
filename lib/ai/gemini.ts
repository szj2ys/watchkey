import { AIProvider, Chapter, TranscriptEntry } from './provider'

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MAX_TRANSCRIPT_LENGTH = 12000

interface GeminiError extends Error {
  status?: number
}

function createGeminiError(message: string, status?: number): GeminiError {
  const error = new Error(message) as GeminiError
  error.status = status
  return error
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

export class GeminiProvider implements AIProvider {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!
    if (!this.apiKey) {
      throw createGeminiError('GEMINI_API_KEY is not set', 500)
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `${GEMINI_ENDPOINT}?key=${this.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      throw createGeminiError(
        `Gemini API error: ${response.status} ${errorBody}`,
        response.status
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw createGeminiError('Gemini API returned empty response', 500)
    }
    return text
  }

  async generateChapters(transcript: string, videoDuration: number): Promise<Chapter[]> {
    const truncated = transcript.slice(0, MAX_TRANSCRIPT_LENGTH)
    const prompt = `You are a video analysis expert. Given the following transcript, generate a JSON array of chapters. Each chapter should have: startTime (seconds), endTime (seconds), title (short descriptive title), summary (1-2 sentence summary). The video duration is ${videoDuration} seconds. Return ONLY valid JSON, no markdown fences.

Transcript:
${truncated}`

    try {
      const response = await this.callGemini(prompt)
      const cleaned = stripMarkdownFences(response)
      const chapters = JSON.parse(cleaned)

      if (!Array.isArray(chapters) || chapters.length === 0) {
        throw createGeminiError('Parsed chapters is not a valid non-empty array', 500)
      }

      return chapters.map((ch: any) => ({
        startTime: Number(ch.startTime) || 0,
        endTime: Number(ch.endTime) || videoDuration,
        title: String(ch.title || 'Chapter'),
        summary: String(ch.summary || ''),
      }))
    } catch (error: any) {
      if (error instanceof SyntaxError || (error as GeminiError).status) {
        // Return single chapter as fallback
        return [{
          startTime: 0,
          endTime: videoDuration,
          title: 'Full Video',
          summary: 'Auto-generated single chapter (AI parsing failed)',
        }]
      }
      throw error
    }
  }

  async generateSummary(transcript: string): Promise<string> {
    const truncated = transcript.slice(0, MAX_TRANSCRIPT_LENGTH)
    const prompt = `Summarize the following video transcript in 2-3 paragraphs. Focus on the key points, main arguments, and conclusions. Write in a clear, informative style.

Transcript:
${truncated}`

    return this.callGemini(prompt)
  }

  async enhanceTranscript(rawTranscript: string): Promise<TranscriptEntry[]> {
    const sentences = rawTranscript
      .replace(/([.!?])\s+/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const entries: TranscriptEntry[] = []
    let time = 0
    for (const sentence of sentences) {
      entries.push({
        startTime: time,
        endTime: time + 5,
        text: sentence,
      })
      time += 5
    }
    return entries
  }
}
