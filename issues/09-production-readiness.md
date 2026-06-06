# Issue 09: Production Readiness

Status: In Progress
Labels: ready-for-agent, enhancement

## Problem Statement

WatchKey has a working MVP flow — a user pastes a YouTube URL, the system runs AI analysis via Gemini, and displays chapters, summary, and transcript on a watch page. However, the current implementation has critical gaps that prevent production deployment:

1. **No data protection**: Anyone who guesses a UUID can read anyone else's analysis. There is no `user_id` on analyses, no RLS enforcement, and API endpoints are completely open.
2. **Unreliable background processing**: The AI analysis runs inside a `setTimeout` within a Vercel serverless function. Once the HTTP response is sent, the function can be killed at any time, leaving analyses permanently stuck in `processing` status.
3. **No abuse protection**: There is no rate limiting on the `/api/analyze` endpoint. Combined with the Gemini API key, this is a direct path to bill exhaustion.
4. **Visual inconsistency**: The footer uses light-theme colors (`border-gray-100`, `text-gray-600`) on an otherwise dark page (`#0f0f0f`), making it nearly invisible.
5. **No error boundaries on AI-generated content**: If Gemini returns malformed JSON, the entire watch page crashes with no recovery path.

The product cannot launch until these are resolved.

## Solution

Harden the existing MVP for production by: wiring up Inngest for durable background analysis, adding Supabase auth + RLS to protect data, implementing rate limiting, fixing the footer theme, and wrapping AI-generated panels in error boundaries.

The goal is a product that is safe, reliable, and visually consistent enough to put in front of real users — not a feature expansion.

## User Stories

1. As a visitor, I want to paste a YouTube URL and get an analysis, so that I can quickly understand a video's content.
2. As a visitor, I want my analysis to complete reliably, so that I don't see a permanently "processing" state.
3. As a visitor, if an analysis fails, I want to see a clear error message and a retry button, so that I can try again.
4. As a visitor, I want to be able to use the product without signing up, so that I can try it before committing.
5. As a signed-in user, I want my analyses to be private and associated with my account, so that other people cannot read my data.
6. As a signed-in user, I want my past analyses to be accessible from a history view, so that I don't lose my work.
7. As a signed-in user, I want to see how many analyses I've used today, so that I can manage my usage within the free tier.
8. As the system, I want to limit anonymous users to 3 analyses per day per IP, so that abuse is prevented.
9. As the system, I want to track analysis usage per user for future billing integration.
10. As the system, I want to use Inngest for background analysis processing, so that analyses complete reliably even under serverless constraints.
11. As the system, I want to update analysis status through a durable state machine (pending → processing → completed/failed), so that stuck states can be detected and retried.
12. As a visitor, I want the footer to look consistent with the rest of the dark-themed page, so that the UI feels polished.
13. As a visitor, if the AI-generated chapters or transcript are malformed, I want the rest of the page to still work, so that a single bad response doesn't break the entire experience.
14. As a visitor, I want to see related videos after viewing an analysis, so that I can discover more content.
15. As a signed-in user, I want to see my YouTube subscription feed on the home page, so that I can quickly analyze videos from channels I follow.
16. As the system, I want to use `SUPABASE_SERVICE_ROLE_KEY` for server-side operations, so that RLS policies don't block background processing.
17. As a visitor, I want the watch page to have proper loading, empty, and error states, so that I always know what's happening.
18. As the system, I want YouTube API keys to never leak to the client bundle, so that the API key is not exposed.
19. As a developer, I want backup files (`*.backup`, `*.patch`) removed from the repo, so that the codebase is clean.
20. As a developer, I want `next.config.ts` to configure security headers and image domains, so that the app is production-ready.
21. As a visitor, I want to see a branded loading state while analysis is in progress, so that the experience feels intentional.
22. As a visitor, I want the "Smart Chapters" and "Full Transcript" feature cards on the home page to have distinct visual cues, so that I can scan them quickly.
23. As a signed-in user, I want to sign out, so that I can manage my session.
24. As a signed-in user, I want Google OAuth to request YouTube read-only scope, so that I can see my subscriptions.
25. As the system, I want a duplicate `parseDuration` / `parseISO8601Duration` to be consolidated into one function, so that divergent behavior is prevented.

## Implementation Decisions

### Module 1: Inngest Background Processing (Deep Module)

**Interface:**
```typescript
// lib/inngest/client.ts
export const inngest: Inngest

// lib/inngest/functions.ts
export const processAnalysis: InngestFunction
// Trigger: inngest.send("analysis.requested", { analysisId, videoId, duration })
// Behavior: fetches transcript, calls AI, updates DB status
// On failure: updates status=failed with error message
// Retry: 3 attempts with exponential backoff
```

**Key decisions:**
- Replace `setTimeout` fire-and-forget in `app/api/analyze/route.ts` with `inngest.send("analysis.requested", ...)`
- Inngest function encapsulates the entire analysis pipeline (transcript fetch → AI chapters → AI summary → DB update)
- Uses `SUPABASE_SERVICE_ROLE_KEY` for DB writes so RLS doesn't block the worker
- Keep `processAnalysisInBackground` as a fallback for local dev without Inngest, but gate it behind a feature flag

### Module 2: Auth + RLS

**Schema change:**
- Add `user_id UUID REFERENCES auth.users(id)` to `analyses` table (nullable for anonymous)
- Create RLS policies: users can read their own analyses; service role bypasses RLS
- Add `usage` table for tracking (user_id, date, count)

**API changes:**
- `POST /api/analyze`: extract user from session; if signed in, set user_id on analysis
- `GET /api/analyses/[id]`: check user_id matches session, or allow if anonymous (for backward compat during migration)
- `GET /api/videos/[id]`: same check

### Module 3: Rate Limiting

**Approach:** Supabase table-based rate limiting (simple, no external dependency)
- Anonymous: 3/day per IP
- Signed-in free: 10/day
- Track in `usage` table with upsert

### Module 4: Error Boundaries

- Wrap `ChapterPanel`, `TranscriptPanel`, and `RecommendationsPanel` in existing `ErrorBoundary` component
- Add `app/watch/[id]/loading.tsx` and `app/watch/[id]/error.tsx` route segments
- `parseChapters` and `parseTranscript` already have fallback logic; error boundary catches unexpected crashes

### Module 5: UI Fixes

- Footer: change `border-gray-100` → `border-[#272727]`, `text-gray-600` → `text-gray-400`, `hover:text-gray-900` → `hover:text-white`
- Consolidate `parseISO8601Duration` in `lib/youtube/service.ts` → import `parseDuration` from `lib/youtube/utils.ts`
- Remove `NEXT_PUBLIC_YOUTUBE_API_KEY` from `.env.template`
- Add `images.remotePatterns` for `i.ytimg.com` in `next.config.ts`
- Add security headers in `next.config.ts`
- Delete backup files: `app/watch/page.tsx.backup`, `app/watch/page.tsx.backup2`, `app/watch/page.tsx.simplify-backup`, `app/watch/[id]/page.tsx.patch`, `components/Header.tsx.backup2`

### Module 6: Supabase Client Fix

- Background worker (`processAnalysisInBackground`) must use `SUPABASE_SERVICE_ROLE_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- API routes that need to bypass RLS (e.g., rate limit checks) should use service role client

## Testing Decisions

**What makes a good test:** Tests verify external behavior through public interfaces. A test that breaks when internal implementation changes but behavior hasn't is wrong.

**Modules to test (priority order):**

1. **Inngest analysis function** — highest priority. Test that it correctly processes a video analysis from pending → completed, handles failures with retry, and updates status in DB. Mock the Gemini API and YouTube transcript fetch. Verify the state machine transitions.

2. **Rate limiter** — test that it correctly blocks after N requests per day, resets at midnight UTC, and distinguishes anonymous vs signed-in users.

3. **RLS policies** — test that a signed-in user can read their own analyses but not others'. Test that anonymous analyses remain accessible by their creator.

4. **parseChapters / parseTranscript** — already have basic tests; add edge cases for malformed JSON, empty arrays, and missing fields.

5. **Footer rendering** — visual test that footer renders with dark-theme colors.

**Prior art:** The codebase has Jest + @testing-library/react with 16 suites and 27 tests. Tests follow a pattern of unit tests for utility functions and component tests for UI. New tests should follow the same patterns.

## Out of Scope

- **Stripe integration / billing**: The `usage` table will be created for tracking, but payment flows are a separate PRD.
- **User library / favorites / notes**: These features exist in the REQUIREMENTS.md but are not blocking production launch.
- **WebSocket real-time updates**: Polling via `GET /api/analyses/[id]` is sufficient for MVP. WebSocket is a future optimization.
- **Multi-provider AI fallback**: Only Gemini is active. MiniMax fallback is architecturally supported but not wired up in this PRD.
- **SEO optimization**: Sitemap, OG tags, structured data are important but not blocking launch.
- **PostHog / analytics integration**: Important for growth but not blocking launch.
- **Landing page redesign**: The current design is functional. Visual polish beyond footer fix is a separate effort.

## Further Notes

### Dependency Order

```
Module 6 (Supabase client fix) ──→ Module 2 (Auth + RLS) ──→ Module 3 (Rate limiting)
Module 1 (Inngest) ───────────→ Module 4 (Error boundaries) ──→ Module 5 (UI fixes)
```

Module 1 and Module 6 can be worked on in parallel. Module 2 depends on Module 6. Module 3 depends on Module 2. Modules 4 and 5 are independent and can be done at any time.

### Success Criteria

- [ ] `npm run build` passes with zero errors
- [ ] `npm test` passes (all existing + new tests)
- [ ] Analysis completes reliably via Inngest (test with 5 real YouTube URLs)
- [ ] Signed-in user cannot read another user's analysis
- [ ] Rate limiter blocks after 3 anonymous analyses
- [ ] Footer is visible and consistent on dark background
- [ ] Malformed AI response doesn't crash the watch page
- [ ] No `*.backup` or `*.patch` files in repo
- [ ] `next.config.ts` has security headers and image domains configured
