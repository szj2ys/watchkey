import { AIProvider, Chapter, TranscriptEntry } from './provider'
import { proxyFetch } from '@/lib/proxy'

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MAX_TRANSCRIPT_LENGTH = 8000

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

function getApiKey(): string {
  return process.env.GEMINI_API_KEY || ''
}

export class GeminiProvider implements AIProvider {
  private apiKey: string

  constructor() {
    this.apiKey = getApiKey()
    if (!this.apiKey) {
      throw createGeminiError('GEMINI_API_KEY is not set', 500)
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `${GEMINI_ENDPOINT}?key=${this.apiKey}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 25000)

    try {
      const response = await proxyFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error')
        throw createGeminiError(`Gemini API error: ${response.status} ${errorBody}`, response.status)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw createGeminiError('Gemini API returned empty response', 500)
      return text
    } finally {
      clearTimeout(timer)
    }
  }

  async generateChapters(transcript: string, videoDuration: number): Promise<Chapter[]> {
    const truncated = transcript.slice(0, MAX_TRANSCRIPT_LENGTH)
    const prompt = `Analyze this video transcript and generate chapters. Return ONLY a JSON array with fields: startTime (seconds), endTime (seconds), title (short), summary (1 sentence). Video duration: ${videoDuration}s. No markdown fences.

Transcript:
${truncated}`

    try {
      const response = await this.callGemini(prompt)
      const cleaned = stripMarkdownFences(response)
      const chapters: unknown[] = JSON.parse(cleaned)

      if (!Array.isArray(chapters) || chapters.length === 0) {
        throw createGeminiError('Invalid chapters', 500)
      }

      return chapters.map((ch: unknown) => {
        const obj = ch as Record<string, unknown>
        return {
          startTime: Number(obj.startTime) || 0,
          endTime: Number(obj.endTime) || videoDuration,
          title: String(obj.title || 'Chapter'),
          summary: String(obj.summary || ''),
        }
      })
    } catch (_error: unknown) {
      console.warn('[gemini] chapters failed, using fallback')
      return [{ startTime: 0, endTime: videoDuration, title: 'Full Video', summary: 'Auto-generated single chapter' }]
    }
  }

  async generateSummary(transcript: string): Promise<string> {
    const truncated = transcript.slice(0, MAX_TRANSCRIPT_LENGTH)
    const prompt = `Summarize this video transcript in 2-3 paragraphs. Focus on key points and conclusions.

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

    return sentences.map((text, i) => ({
      startTime: i * 5,
      endTime: (i + 1) * 5,
      text,
    }))
  }
}
