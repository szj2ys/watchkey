import { AIProvider, Chapter, TranscriptEntry } from './provider'
import { GeminiProvider } from './gemini'

export class AIService {
  private provider: AIProvider

  constructor() {
    this.provider = new GeminiProvider()
  }

  async generateChapters(transcript: string, videoDuration: number): Promise<Chapter[]> {
    return this.provider.generateChapters(transcript, videoDuration)
  }

  async generateSummary(transcript: string): Promise<string> {
    return this.provider.generateSummary(transcript)
  }

  async enhanceTranscript(rawTranscript: string): Promise<TranscriptEntry[]> {
    return this.provider.enhanceTranscript(rawTranscript)
  }
}
