## Background & Data Assessment

WatchKey MVP (Issues #1-#7) is fully delivered: YouTube video analysis with Aura Luxury dark glassmorphism UI, real Gemini AI, chapters/summary/transcript, and full a11y testing.

However, the product is **stateless** with no user identity:

- **No authentication**: No Supabase Auth integration, no login/signup flow
- **No analysis history**: Users cannot return to past analyses — 100% retention cliff
- **No rate limiting**: Freemium model (3 free/day per REQUIREMENTS.md) cannot be enforced
- **No monetization path**: Stripe integration requires authenticated users with tracked usage
- **Schema ready**: `supabase/migrations/0003_add_user_id.sql` already adds `user_id` column (unused)

### North Star Metric

**7-Day User Retention Rate**: % of users who return within 7 days and perform 1 analysis. Current: ~0%. Target: ≥ 25%.

### Guardrail Metrics

- Analysis submission success rate: must remain ≥ 95%
- Time to first analysis: must remain ≤ 30s from landing to Analyze click
- Page load TTI: must remain ≤ 1.2s

---

## User Journey (As-Is / To-Be)

### As-Is (Stateless)
1. Visit `/`, paste URL, click ANALYZE
2. Wait ~2min, view results on `/watch/[id]`
3. Close tab. **All data lost forever.**

### To-Be (Authenticated + History)
1. Anonymous users can still use immediately (1 analysis)
2. After first analysis: "Save your analysis — create a free account" prompt
3. Sign up via email/password or OAuth (Google/GitHub) via Supabase Auth
4. Analysis linked to user ID. `/history` shows all past analyses
5. Returning users auto-recognized. Rate limiting: "3/3 analyses used today"

---

## Functional Requirements (MoSCoW + ICE)

### Must Have

**F01: Supabase Auth Integration (Email + OAuth)**
- Email/password sign-up + Google OAuth. Auth middleware for protected routes. Anonymous users can use 1 analysis before sign-up prompt.
- ICE: Impact 5, Confidence 5, Ease 3 | **Score: 75**

**F02: User Identity & Analysis Ownership**
- Link `analyses` to `auth.users` via existing `user_id` column. Update `/api/analyze` to stamp user_id. Implement RLS policies (users read own analyses only).
- ICE: Impact 5, Confidence 5, Ease 3 | **Score: 75**

**F03: Analysis History Page (`/history`)**
- Grid/list of past analyses with video thumbnail, title, channel, date, status. Click → `/watch/[id]`. Aura Luxury styling.
- ICE: Impact 4, Confidence 5, Ease 4 | **Score: 80**

### Should Have

**F04: Usage Tracking & Rate Limiting**
- Track daily analysis count per user. Free: 3/day (UTC reset). Display remaining count on home page. Server-side enforcement.
- ICE: Impact 4, Confidence 5, Ease 3 | **Score: 60**

**F05: Profile Dropdown with Auth State**
- Logged-out: Sign In / Sign Up. Logged-in: email, Analysis History link, Sign Out. Leverage existing accessible dropdown.
- ICE: Impact 3, Confidence 5, Ease 4 | **Score: 60**

### Could Have

**F06: Post-Analysis Sign-Up Prompt**
- Non-intrusive glassmorphism toast after anonymous first analysis. Does not block results.
- ICE: Impact 3, Confidence 4, Ease 4 | **Score: 48**

---

## Acceptance Criteria (Given/When/Then)

**Scenario 1: New User Sign-Up**
- Given a visitor with no account
- When they click "Sign Up" and complete email/password registration
- Then they are authenticated and profile dropdown shows their email + "Analysis History"

**Scenario 2: Authenticated Analysis Persistence**
- Given a logged-in user who submits a URL
- When analysis completes
- Then the record has their `user_id` and appears on `/history`

**Scenario 3: Analysis History Page**
- Given a logged-in user with 3 completed analyses
- When they navigate to `/history`
- Then they see 3 entries with thumbnail, title, channel, date
- And clicking any entry navigates to `/watch/[id]`

**Scenario 4: Anonymous User Can Still Analyze**
- Given a visitor with no account
- When they paste a URL and click ANALYZE
- Then the analysis runs without login
- And a subtle sign-up prompt appears after completion

**Scenario 5: Rate Limiting**
- Given a free user with 3 analyses today
- When they attempt a 4th
- Then the Analyze button is disabled: "Daily limit reached (3/3)" with upgrade CTA

---

## Milestones

**M1: Supabase Auth Setup & Middleware (1.0 day)** — Configure auth providers, update Supabase client for session management

**M2: Analysis Ownership & RLS (0.5 day)** — Stamp user_id on analyses, implement RLS policies

**M3: History Page & Profile Dropdown (1.5 day)** — Build `/history` with Aura styling, auth-aware header dropdown

**M4: Rate Limiting & Usage Display (1.0 day)** — Daily usage tracking, server-side enforcement, client-side display

---

## Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Auth adds friction to first use | Allow anonymous first analysis; prompt sign-up only after |
| Supabase Auth cold start latency | SSR session check with cookies; no client-side blocking |
| Google OAuth requires setup | Start with email/password only; add OAuth next cycle |
| RLS blocks Inngest worker | Use service role key for Inngest, bypassing RLS |

---

## PR Traceability

- Depends on: Issues #1-#7 (all closed, MVP complete)
- Schema ready: `0003_add_user_id.sql` adds `user_id` column
- Existing code: Header.tsx has profile dropdown scaffold from Issue #5


## Task Checklist

- [x] #9 — Auth & Database Types (Supabase Auth UI + Type Sync)
- [ ] #10 — Analysis Ownership (user_id stamping in /api/analyze)
- [ ] #11 — Analysis History Page (/history with Aura styling)
- [x] #12 — Rate Limiting & Post-Analysis Prompt (daily usage tracking)




