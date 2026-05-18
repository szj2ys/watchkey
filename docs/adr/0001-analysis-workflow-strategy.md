# Analysis Workflow Strategy

## Status
Accepted

## Context
We need to implement the analysis workflow for WatchKey, which includes:
- Extracting YouTube video ID and metadata
- Fetching transcript (if available)
- Using AI providers (MiniMax/Gemini) to generate chapters, summary, and structured transcript
- Storing results in Supabase
- Providing API endpoints for clients to trigger analysis and poll for results

Key decisions needed:
1. AI provider configuration strategy (selection and fallback)
2. YouTube transcript fetching method
3. Analysis worker architecture (background job vs inline processing)
4. Error handling strategy

## Decision

### 1. AI Provider Configuration Strategy
We will use an adapter pattern with configurable primary and fallback providers:
- Primary provider: Gemini (Google)
- Fallback provider: MiniMax
- Configuration via environment variables:
  - `AI_PRIMARY_PROVIDER` (default: "gemini")
  - `AI_FALLBACK_PROVIDER` (default: "minimax")
  - Provider-specific API keys: `GEMINI_API_KEY`, `MINIMAX_API_KEY`
- The AI service will attempt the primary provider first, and automatically fallback to the secondary provider on:
  - API rate limits (429)
  - Service unavailable (503)
  - Authentication errors (401, 403)
  - Timeout errors
- All providers must implement a common interface:
  ```typescript
  interface AIProvider {
    generateChapters(transcript: string, videoDuration: number): Promise<Chapter[]>;
    generateSummary(transcript: string): Promise<string>;
    enhanceTranscript(rawTranscript: string): Promise<TranscriptEntry[]>;
  }
  ```

### 2. YouTube Transcript Fetching Method
We will use the following approach in order of preference:
- **Primary**: YouTube Data API v3 (requires API key) to fetch captions
  - Requires setting `YOUTUBE_API_KEY` environment variable
  - Most reliable and official method
- **Fallbacks** (if YouTube Data API not configured or fails):
  1. `youtube-transcript` npm package (unofficial but reliable)
  2. Invidious instance scraping (as last resort)
  3. yt-dlp (if available in runtime environment)
- Transcript will be cached in Supabase for 24 hours to avoid repeated fetching
- We will attempt to fetch auto-generated captions if manual captions not available

### 3. Analysis Worker Architecture
We will implement a **background job processing system** using:
- Supabase database as job queue (simpler than external queue for MVP)
- Polling-based worker that checks for pending jobs every 10 seconds
- Worker runs as a separate Node.js process (can be deployed on Vercel cron, Render worker, or similar)
- Job status tracking in `analyses` table:
  - `pending`: Job created, waiting to be processed
  - `processing`: Worker has claimed the job
  - `completed`: Analysis finished successfully
  - `failed`: Analysis failed (with error message stored)
- Why background job:
  - Analysis can take up to 2 minutes (exceeds typical API timeout limits)
  - Better user experience (non-blocking request)
  - Enables retry mechanisms and better error handling
  - Scales better under load

### 4. Error Handling Strategy
We will implement layered error handling:
- **Client-side** (API routes):
  - Validate YouTube URL format
  - Return 400 for invalid requests
  - Return 500 for unexpected errors with generic message (don't leak internal details)
  - Include request ID in all responses for tracing
- **Worker-side**:
  - Catch all exceptions in job processing
  - On error:
    - Update analysis status to `failed`
    - Store error message in `analyses.error` (new column)
    - Log full error stack internally (not returned to client)
    - Implement retry mechanism (max 3 attempts with exponential backoff)
  - Specific error types:
    - YouTube API errors: Retry with fallback method
    - AI provider errors: Trigger fallback provider
    - Database errors: Retry job after delay
    - Network errors: Retry with exponential backoff
- **User-facing**:
  - API clients can poll `/api/analyses/[id]` to check status
  - Frontend shows appropriate UI states:
    - `pending`: "Queued for analysis..."
    - `processing`: "Analyzing... (this may take up to 2 minutes)"
    - `completed`: Show results
    - `failed`: Show error message with retry button

## Consequences
### Positive
- Clear separation of concerns between API layer and processing layer
- Robust error handling with automatic fallbacks and retries
- Scalable design that can handle multiple concurrent analyses
- Provider flexibility to switch or add new AI services
- Reliable transcript fetching with multiple fallback options

### Negative
- Increased system complexity (background worker, job queue)
- Requires monitoring for worker health and queue depth
- Slightly longer time to first result due to worker polling latency (max 10s)
- Need to manage and secure multiple API keys

## Implementation Notes
- Add `error` column to `analyses` table: `error TEXT`
- Create Supabase migration for the new column
- Worker implementation will be in `scripts/analysis-worker.ts`
- API routes will be in `app/api/analyze/route.ts`, `app/api/analyses/[id]/route.ts`, `app/api/videos/[id]/route.ts`
- AI adapter pattern in `lib/ai/` directory with provider implementations
