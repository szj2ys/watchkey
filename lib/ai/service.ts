import { AIProvider } from './provider'
import { GeminiProvider } from './gemini'
import { MiniMaxProvider } from './minimax'

export class AIService {
  private primary: AIProvider
  private fallback: AIProvider

  constructor() {
    const primaryProviderName = process.env.AI_PRIMARY_PROVIDER || 'gemini'
    const fallbackProviderName = process.env.AI_FALLBACK_PROVIDER || 'minimax'

    this.primary = this.createProvider(primaryProviderName)
    this.fallback = this.createProvider(fallbackProviderName)
  }

  private createProvider(name: string): AIProvider {
    switch (name.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider()
      case 'minimax':
        return new MiniMaxProvider()
      default:
        throw new Error(`Unknown AI provider: ${name}`)
    }
  }

  /**
   * Attempts to call the primary provider, and falls back to the secondary provider
   * on specific error conditions.
   */
  async withFallback<T>(operation: (provider: AIProvider) => Promise<T>): Promise<T> {
    try {
      return await operation(this.primary)
    } catch (primaryError: any) {
      // Check if we should fallback based on error type
      const shouldFallback = this.isFallbackError(primaryError)
      if (shouldFallback) {
        try {
          return await operation(this.fallback)
        } catch (fallbackError: any) {
          // If fallback also fails, throw the fallback error (or combine errors)
          throw fallbackError
        }
      } else {
        // Don't fallback, throw the original error
        throw primaryError
      }
    }
  }

  private isFallbackError(error: any): boolean {
    // Fallback on: 429 (rate limit), 503 (service unavailable), 401/403 (auth), timeout
    if (error.status) {
      const status = error.status
      return [429, 503, 401, 403].includes(status)
    }
    // Also fallback on timeout errors (e.g., error.code === 'ETIMEDOUT')
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return true
    }
    return false
  }

  // Delegate methods to the withFallback wrapper
  async generateChapters(transcript: string, videoDuration: number): Promise<any> {
    return this.withFallback((provider) => provider.generateChapters(transcript, videoDuration))
  }

  async generateSummary(transcript: string): Promise<string> {
    return this.withFallback((provider) => provider.generateSummary(transcript))
  }

  async enhanceTranscript(rawTranscript: string): Promise<any> {
    return this.withFallback((provider) => provider.enhanceTranscript(rawTranscript))
  }
}
