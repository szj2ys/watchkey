# WatchKey Product Requirements Document

## 1. 产品概述

### 1.1 产品定位
WatchKey 是一个 YouTube 视频智能分析工具，通过 AI 技术为长视频生成结构化内容（章节、摘要、字幕），帮助用户快速理解视频核心内容。

### 1.2 核心价值
- **节省时间**: 通过 AI 生成的章节和摘要，快速掌握视频要点
- **精准导航**: 点击时间戳直接跳转到视频对应位置
- **极简体验**: YouTube 风格 UI，零学习成本

## 2. 功能需求

### 2.1 Home 页面（落地页）

#### 2.1.1 页面结构
```
┌─────────────────────────────────────────┐
│  [≡] [Logo] WatchKey        [Profile]   │  ← Header
├─────────────────────────────────────────┤
│                                         │
│     "Understand any video in minutes"   │  ← Hero Title
│     "AI-generated chapters..."          │  ← Subtitle
│                                         │
│     [Paste YouTube URL] [Analyze]       │  ← Input + Button
│     "Analysis takes ~2 minutes"         │  ← Hint
│                                         │
│     [Feature Cards x3]                  │  ← Features
│                                         │
├─────────────────────────────────────────┤
│     © WatchKey • Privacy • Terms        │  ← Footer
└─────────────────────────────────────────┘
```

#### 2.1.2 功能详情

**Header**
- 左侧: 汉堡菜单图标 + Logo + 品牌名 "WatchKey"
- 右侧: 用户头像（圆形，点击可登录）

**Hero Section**
- 主标题: "Understand any video in minutes"（超大粗体）
- 副标题: "AI-generated chapters, summaries, and transcripts."
- URL 输入框:
  - 药丸形状（高度 56px，圆角 28px）
  - Placeholder: "Paste YouTube URL here"
  - 左侧预留 YouTube 图标位置
- Analyze 按钮:
  - 品牌主色（蓝色 #3b82f6）
  - 药丸形状，与输入框同高
  - 文字: "Analyze"
- 提示文字: "Analysis takes ~2 minutes"

**Feature Cards（3列）**
1. Smart Chapters - Auto-generated video sections
2. Key Summaries - Extract main points instantly
3. Full Transcript - Click timestamps to navigate

**Footer**
- 单行居中: © WatchKey • Privacy • Terms

### 2.2 Watch 页面（视频分析结果页）

#### 2.2.1 页面结构
```
┌──────────────────────────────────────────────────────────┐
│  [←] WatchKey                              [Profile]     │  ← Header
├──────────────────────────────┬───────────────────────────┤
│                              │                           │
│      VIDEO PLAYER            │   Chapters                │
│      (70% width)             │   ───────────────────     │
│      16:9 ratio              │   [00:00] Introduction    │
│      with custom controls    │   [01:15] Fundamentals ✓  │  ← Active
│                              │   [04:30] Key Benefits    │
│      ─────────────────       │   [08:50] Future Trends   │
│      Title                   │   [11:20] Q&A Session     │
│      Channel • Views         │                           │
│      [Share] [Save]          │   ───────────────────     │
│                              │                           │
│      ─────────────────       │   Up Next                 │
│      AI Summary              │   [Thumbnail] Title       │
│      [bullet points]         │   Channel                 │
│                              │                           │
│      ─────────────────       │   [Thumbnail] Title       │
│      Transcript              │   Channel                 │
│      [00:15] Text...         │                           │
│      [00:23] Text...         │                           │
│                              │                           │
└──────────────────────────────┴───────────────────────────┘
```

#### 2.2.2 功能详情

**Header**
- 左侧: 返回箭头 + "WatchKey"
- 右侧: 用户头像

**Left Column (70%)**

*Video Player*
- YouTube 嵌入或自定义播放器
- 16:9 比例，大圆角（参考最新 YouTube 风格）
- 自定义控制栏:
  - 播放/暂停、下一集、音量
  - 进度条（可点击跳转）
  - 设置、全屏
  - 当前时间 / 总时长

*Video Info*
- 标题: 大字号、粗体
- 元信息: 频道名 • 观看数 • 分析时间
- 操作按钮: Share、Save（YouTube 风格药丸按钮）

*AI Summary Card*
- 标题栏: "AI Summary" + 折叠按钮
- 内容: bullet list 形式的关键点
- 默认展开

*Transcript Card*
- 标题栏: "Transcript" + 折叠按钮
- 内容: 时间戳 + 文本，垂直列表
- 时间戳可点击，点击后视频跳转到对应位置
- 可滚动区域（自定义细滚动条）

**Right Column (30%)**

*Chapters Section*
- 标题: "Chapters"
- 章节列表:
  - 每项: 时间戳 + 章节标题
  - 圆角背景（浅灰色）
  - 当前播放章节: 品牌色高亮 + 播放图标
  - 悬停: 背景变深
  - 点击: 视频跳转到对应时间

*Up Next Section*
- 标题: "Up Next"
- 推荐视频列表:
  - 缩略图（16:9，圆角）
  - 标题（最多两行）
  - 频道名
  - 悬停: 标题变品牌色

## 3. 技术需求

### 3.1 技术栈
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Provider**: MiniMax / xAI Grok / Google Gemini (适配器模式)

### 3.2 数据库 Schema

**videos**
```sql
id: uuid (primary key)
youtube_id: string (unique)
title: string
channel: string
duration: integer (seconds)
thumbnail_url: string
created_at: timestamp
```

**analyses**
```sql
id: uuid (primary key)
video_id: uuid (foreign key)
chapters: jsonb -- [{title, start_time, end_time, summary}]
summary: text
transcript: jsonb -- [{timestamp, text}]
status: enum ('pending', 'processing', 'completed', 'failed')
created_at: timestamp
```

### 3.3 API 端点

**POST /api/analyze**
- 输入: YouTube URL
- 输出: analysis_id
- 流程:
  1. 提取 YouTube video ID
  2. 获取视频元数据
  3. 异步调用 AI 分析
  4. 返回 analysis_id 供轮询

**GET /api/analyses/:id**
- 获取分析结果
- 支持轮询状态

**GET /api/videos/:id**
- 获取视频详情 + 最新分析结果

## 4. 用户流程

```
1. 访问 Home 页
   ↓
2. 粘贴 YouTube URL
   ↓
3. 点击 Analyze
   ↓
4. 显示进度（~2分钟）
   ↓
5. 自动跳转到 Watch 页
   ↓
6. 观看视频，浏览 Chapters/Summary/Transcript
   ↓
7. 点击时间戳跳转
```

## 5. UI/UX 规范

### 5.1 设计风格
- **参考**: 最新版 YouTube (2023-2024)
- **特征**:
  - 大量圆角（按钮 28px，卡片 12-16px）
  - 无边框设计，依靠间距和背景色区分
  - 高对比度排版（粗体标题 + 浅灰辅文）
  - 药丸形按钮（面性，非描边）

### 5.2 颜色
- **品牌色**: #3b82f6 (蓝色)
- **背景**: #ffffff, #f8fafc, #f1f5f9
- **文字**: #0f0f0f (主), #64748b (辅)

### 5.3 字体
- **Family**: Inter
- **标题**: 24-64px, bold (700-800)
- **正文**: 14-16px, regular (400)
- **辅助**: 12-14px, medium (500), 灰色

### 5.4 间距
- **页面**: max-width 1400px，居中
- **板块**: 24-32px 间距
- **元素**: 12-16px 间距

## 6. 性能指标

- **分析时间**: < 2 分钟
- **首屏加载**: < 1.5 秒
- **视频支持**: 最长 4 小时

## 7. 开发阶段

### Phase 1: MVP
- Home 页面（URL 输入 + 分析触发）
- Watch 页面（播放器 + Chapters + Summary + Transcript）
- 基础 AI 分析流程

### Phase 2: 增强
- 用户认证
- 历史记录
- 分享功能

## 8. 注意事项

- 不实现 AI Chat（MVP 阶段移除）
- 不实现 Notes（MVP 阶段移除）
- 不实现 Smart/Fast 模式选择（单一模式）
- 优先保证核心体验：章节导航、摘要、字幕
<!-- /autoplan restore point: /Users/szj/.gstack/projects/szj2ys-watchkey/dev-autoplan-restore-20260524-211400.md -->

<!-- AUTONOMOUS DECISION LOG -->
## /autoplan Review Report
**Branch:** dev (GitHub) | **Base:** main  
**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**UI Scope:** YES (Home page, Watch page, multiple UI components)  
**DX Scope:** NO (end-user consumer product, no developer-facing API/CLI/SDK)  
**Mode:** SELECTIVE EXPANSION (hold current scope, surface expansion candidates)

---

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|---------------|-----------|----------|----------|


---

## Phase 1: CEO Review (Strategy & Scope)

### 0A. Premise Challenge

**Premise 1:** "Users need AI-generated chapters, summaries, and transcripts for YouTube videos."
- **Verdict:** VALID. The core problem is real — long-form YouTube content is hard to navigate. The 2-minute analysis time is a reasonable trade-off for structured content.
- **Risk:** The premise assumes users will wait 2 minutes for analysis. This needs to be validated with real users. The async processing via Inngest is the right architectural choice.

**Premise 2:** "YouTube-style UI with zero learning curve."
- **Verdict:** VALID but ASSUMED. The plan assumes familiarity with YouTube's UI patterns. This is reasonable for the target audience but should be validated.

**Premise 3:** "Freemium model with 3 free analyses/day."
- **Verdict:** UNPROVEN. The PRD mentions this but REQUIREMENTS.md doesn't detail the rate-limiting implementation. The database schema has no `usage` table or rate-limiting mechanism. This is a **critical gap** — the billing/monetization model is mentioned but not architected.

**Premise 4:** "MVP excludes AI Chat, Notes, and mode selection."
- **Verdict:** CORRECT. Good scoping discipline. These are Phase 2 features.

### 0B. Existing Code Leverage

| Sub-Problem | Existing Code | Status |
|---|---|---|
| YouTube URL parsing | `lib/youtube/parser.ts` | ✅ Implemented |
| YouTube metadata fetching | `lib/youtube/service.ts` | ✅ Implemented with API + fallback |
| Transcript fetching | `lib/youtube/service.ts` | ✅ Implemented with proxy support |
| AI provider adapter | `lib/ai/provider.ts`, `lib/ai/service.ts` | ✅ Implemented with fallback |
| Gemini integration | `lib/ai/gemini.ts` | ✅ Implemented |
| MiniMax integration | `lib/ai/minimax.ts` | ⚠️ Mock/TODO — returns hardcoded data |
| Background processing | `lib/inngest/functions.ts` | ✅ Implemented |
| Database schema | `supabase/migrations/0000_initial_schema.sql` | ✅ Implemented |
| API: trigger analysis | `app/api/analyze/route.ts` | ✅ Implemented |
| API: poll results | `app/api/analyses/[id]/route.ts` | ✅ Implemented |
| API: video details | `app/api/videos/[id]/route.ts` | ✅ Implemented |
| Home page UI | `app/page.tsx`, `components/HeroForm.tsx` | ✅ Implemented |
| Watch page UI | `app/watch/[id]/page.tsx` | ✅ Implemented |
| Auth/Usage tracking | — | ❌ Not implemented |
| Rate limiting | — | ❌ Not implemented |
| Payment/Stripe | — | ❌ Not implemented (Phase 2) |

### 0C. Dream State Mapping

```
CURRENT STATE (main branch)          THIS PLAN (dev branch)              12-MONTH IDEAL
─────────────────────────            ─────────────────────               ─────────────────
Empty Next.js scaffold       --->    Full MVP with Home + Watch   --->   Production app with
No database                          pages, API routes, DB schema,       user accounts, payment,
No AI integration                    AI analysis pipeline, Inngest       mobile app, browser
No UI components                    async processing, YouTube-style     extension, API for
                                     UI with chapters/summary/           third-party use,
                                     transcript display                  team features
```

**Dream State Delta:** This plan delivers the core MVP. The 12-month ideal requires: user accounts with Supabase Auth, Stripe payment integration, rate limiting, mobile responsive design (partially addressed), and potentially a browser extension. The current plan moves strongly toward the ideal but leaves monetization and user management for Phase 2.

### 0C-bis. Implementation Alternatives

**APPROACH A: Current Approach (Next.js + Supabase + Inngest)**
- Summary: Full-stack Next.js with Supabase for DB/auth, Inngest for async jobs, Gemini/MiniMax for AI
- Effort: L (already implemented)
- Risk: Medium (vendor lock-in to Supabase + Inngest)
- Pros: Rapid development, serverless deployment, managed infrastructure
- Cons: Inngest adds operational complexity, Supabase cold starts, dual AI provider maintenance

**APPROACH B: Simplified (Next.js + Supabase only, no Inngest)**
- Summary: Remove Inngest, use Vercel cron jobs or simple polling for background work
- Effort: M (remove Inngest, add cron-based worker)
- Risk: Lower (fewer moving parts)
- Pros: Simpler deployment, fewer dependencies
- Cons: Less reliable job processing, no built-in retry mechanism

**APPROACH C: Self-hosted worker (Next.js + Supabase + separate worker service)**
- Summary: Deploy analysis worker as a separate service (e.g., Render worker, Railway)
- Effort: XL (separate deployment pipeline)
- Risk: Higher (more infrastructure to manage)
- Pros: Full control, better for high-volume processing
- Cons: Over-engineered for MVP

**RECOMMENDATION:** Approach A (current) is correct for MVP. Inngest provides reliable retries and step-based execution that would be painful to rebuild. The operational complexity is justified.

### 0D. Mode-Specific Analysis (SELECTIVE EXPANSION)

**Complexity Check:** The plan touches ~35 files across the codebase. This is appropriate for the scope — it's a full MVP with frontend, backend, database, and AI integration. No unnecessary complexity detected.

**Minimum Viable Scope:** The current plan IS close to minimum viable. The core loop (paste URL → analyze → view results) is complete.

**Expansion Candidates:**

1. **User Authentication (Supabase Auth)** — Effort: M. The schema supports it but no auth flow is implemented. Without it, there's no user-specific data, no history, and no way to enforce rate limits.
2. **Analysis History / Library Page** — Effort: S-M. The data model supports it; a UI page showing past analyses would be valuable.
3. **Shareable Links** — Effort: S. The watch page already has a route; making analyses shareable via URL is nearly free.
4. **Real-time Progress Updates** — Effort: M. Currently the frontend polls. WebSocket or SSE would improve UX.
5. **Error Recovery / Retry UI** — Effort: S. The API returns errors but the frontend retry UX is basic.

### Phase 1 Findings Summary

**Critical Issues:**
1. **MiniMax provider is a mock** — `lib/ai/minimax.ts` returns hardcoded data. The fallback AI provider doesn't work. If Gemini fails, users get fake results.
2. **No rate limiting** — The freemium model requires 3 analyses/day limit but there's no implementation.
3. **No user authentication** — The schema has no users table, no auth middleware, no session management.
4. **Analysis worker has dual implementations** — Both `scripts/analysis-worker.ts` (polling-based) and `lib/inngest/functions.ts` (event-driven) exist. The Inngest version is used by the API, but the polling worker is dead code that will confuse future developers.

**High Issues:**
5. **No loading/empty states on Watch page** — The `page.tsx` has basic loading but no skeleton states, no empty chapter handling, no graceful degradation when AI returns empty results.
6. **Transcript click-to-seek not implemented** — The PRD specifies clicking timestamps should jump the video, but the YouTube IFrame API integration is incomplete (no `seekTo` call).
7. **No responsive design** — The PRD specifies mobile/tablet/desktop screenshots exist but the implementation uses fixed 70/30 layout that won't work on mobile.
8. **Database RLS is too permissive** — All tables allow public read/write. This is fine for MVP but needs tightening before launch.

**Medium Issues:**
9. **No error column in initial schema** — Added in migration 0002, but the initial schema should have included it.
10. **No caching layer** — YouTube API calls and transcript fetches aren't cached. Repeated analyses of the same video re-fetch everything.
11. **Inngest chapters stored as strings, not structured JSON** — The Inngest function maps chapters to `"mm:ss Title"` strings, losing the structured data (endTime, summary) that the Gemini provider returns.


---

## Phase 2: Design Review

### Design Scope Assessment
- **Completeness:** 4/10 — The PRD has detailed page structures and UI specifications, but the prototype screenshots are in `docs/prototype/` and the actual implementation doesn't match the spec in several areas.
- **DESIGN.md:** Not found. No design system documentation exists.
- **Existing Patterns:** shadcn/ui components (button, card, accordion, input, scroll-area, separator, skeleton) are used but not always consistently.

### Design Litmus Scorecard

| Dimension | Score | Assessment |
|---|---|---|
| 1. Information Hierarchy | 5/10 | Hero section is well-structured. Watch page mixes video info, summary, transcript without clear visual hierarchy. |
| 2. Missing States | 3/10 | No loading skeletons, no empty state for 0 chapters, no partial data state, no network error UI. |
| 3. User Journey | 5/10 | Home → Analyze → Watch flow works. No progress indication during analysis. No way to get back to Home from Watch. |
| 4. Specificity | 6/10 | PRD has specific dimensions (56px input, 28px radius, 70/30 split). Implementation uses Tailwind classes but doesn't consistently match. |
| 5. Interaction Design | 4/10 | Chapter click-to-jump not implemented. Transcript click-to-seek not implemented. No hover states defined. |
| 6. Responsive Design | 3/10 | Fixed 70/30 layout won't work on mobile. No mobile-specific breakpoints in the watch page. PRD references mobile screenshots but implementation is desktop-only. |
| 7. Accessibility | 2/10 | No ARIA labels, no keyboard navigation, no focus management. YouTube IFrame has no title. Color contrast not verified. |

### Key Design Issues

**Critical:**
1. **No loading states** — Users see a blank screen while data fetches. The skeleton component exists but isn't used in the watch page.
2. **No error states** — API failures show generic error text. No retry button, no error illustration, no guidance on what to do next.
3. **Chapters are strings, not structured UI** — The Inngest function stores chapters as `"0:00 Introduction"` strings instead of structured objects. The chapter list UI can't show endTime, summary, or proper timestamps.

**High:**
4. **Not responsive** — The 70/30 layout on Watch page doesn't stack on mobile. The PRD has mobile mockups but the implementation ignores them.
5. **Chapter click doesn't seek video** — The core interaction (click timestamp → jump to video position) is not implemented.
6. **No visual feedback on active chapter** — PRD specifies current chapter should be highlighted with brand color and playing icon.

**Medium:**
7. **Inconsistent header components** — Both `components/Header.tsx` and `components/layout/Header.tsx` exist with different implementations.
8. **Footer is minimal** — Just copyright text. PRD specifies Privacy and Terms links (which exist as pages but aren't linked in the footer).
9. **No share functionality** — PRD mentions Share button but it's not implemented.


---

## Phase 1: CEO Review — Dual Voices

### CODEX SAYS (CEO — strategy challenge)
See Codex output above. Key strategic blind spots identified:
1. No validated differentiation from existing tools (YouTube auto-chapters, Harpa, Glasp, Summarize.tech)
2. Freemium model without auth/rate limiting is a structural contradiction
3. Two worker architectures = unresolved technical strategy
4. MiniMax mock makes multi-provider architecture fictional
5. Chapters as formatted strings = future migration pain
6. No real-time progress for the core wait experience
7. Desktop-only layout for a mobile-first use case
8. No competitive moat articulated

### CLAUDE SUBAGENT (CEO — strategic independence)
Key findings:
1. MiniMax provider is a mock (returns hardcoded Chapters) — CRITICAL
2. No rate limiting despite freemium model — CRITICAL
3. No user authentication — CRITICAL
4. Dual worker implementations (Inngest + polling script) — HIGH
5. No loading/empty states on Watch page — HIGH
6. Transcript click-to-seek not implemented — HIGH
7. No responsive design — HIGH
8. Database RLS too permissive — MEDIUM

### CEO DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Premises valid?                   ⚠️      ❌      DISAGREE — Codex challenges fundamental differentiation
  2. Right problem to solve?           ✅      ❌      DISAGREE — Valid use case but crowded market
  3. Scope calibration correct?        ⚠️      ⚠️      CONFIRMED — Both flag scope issues (auth, rate limiting gaps)
  4. Alternatives sufficiently explored? ⚠️    ❌      DISAGREE — No competitive analysis in PRD
  5. Competitive/market risks covered?  ❌      ❌      CONFIRMED — Neither PRD addresses competitive threats
  6. 6-month trajectory sound?         ⚠️      ⚠️      CONFIRMED — Both flag technical debt risks
═══════════════════════════════════════════════════════════════
Model agreement: 2/6 confirmed, 3 disagree, 1 partial. Significant strategic concerns from both models.

---

## Phase 3: Eng Review + Dual Voices

### Architecture ASCII Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 15 (App Router)               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Home Page    │  │  Watch Page   │  │  Privacy/Terms    │  │
│  │  app/page.tsx │  │  app/watch/   │  │  app/privacy/     │  │
│  │  + HeroForm   │  │  [id]/page.tsx│  │  app/terms/       │  │
│  │  + Features   │  │  + YouTube    │  │                   │  │
│  │  + Header     │  │    Player     │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘  │
│         │                  │                                  │
│  ┌──────┴──────────────────┴─────────────────────────────┐   │
│  │                   API Routes                           │   │
│  │  POST /api/analyze  │  GET /api/analyses/[id]         │   │
│  │  GET /api/videos/[id]                                 │   │
│  └──────┬──────────────────┬─────────────────────────────┘   │
│         │                  │                                  │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌───────────────────┐  │
│  │  YouTube     │  │  AI Service   │  │  Inngest          │  │
│  │  Service     │  │  (Adapter)    │  │  (Async Worker)   │  │
│  │  - parser    │  │  - Gemini ✅  │  │  - processAnalysis│  │
│  │  - metadata  │  │  - MiniMax ❌ │  │  - retries: 3     │  │
│  │  - transcript│  │  - fallback   │  │                   │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                          │                  │                 │
└──────────────────────────┼──────────────────┼─────────────────┘
                           │                  │
                    ┌──────┴──────────────────┴──────┐
                    │         Supabase                  │
                    │  ┌──────────┐  ┌──────────────┐  │
                    │  │  videos   │  │  analyses    │  │
                    │  │  - id     │  │  - id        │  │
                    │  │  - youtube│  │  - video_id  │  │
                    │  │  _id     │  │  - chapters  │  │
                    │  │  - title  │  │  - summary   │  │
                    │  │  - channel│  │  - transcript│  │
                    │  │  - duration│ │  - status    │  │
                    │  │  - thumb  │  │  - error     │  │
                    │  └──────────┘  └──────────────┘  │
                    └─────────────────────────────────┘
```

### Section 1: Architecture Review

**Coupling Assessment:**
- **API ↔ Supabase:** Tight coupling via server-side client. Acceptable for MVP but should be abstracted behind a repository pattern for testability.
- **AI Service ↔ Providers:** Good adapter pattern. The `AIService.withFallback()` wrapper is clean. Issue: MiniMax is a mock.
- **Inngest ↔ Supabase:** The Inngest function creates its own Supabase client with anon key. This bypasses RLS since it uses the anon key directly — functionally correct but the client should use a service role key for background operations.
- **Frontend ↔ API:** Clean REST-like API. No TypeScript types shared between frontend and backend — the watch page uses `any` types extensively.

**Architecture Issues:**
1. **`any` types throughout watch page** (`app/watch/[id]/page.tsx`) — The entire page uses `any` for state, API responses, and player references. This defeats TypeScript's purpose.
2. **No API response types** — The API routes return raw Supabase data. No DTOs or response type definitions.
3. **No error boundary** — No React error boundaries exist. A rendering crash will white-screen the entire app.
4. **YouTube IFrame API loaded via script tag injection** — The watch page manually creates a `<script>` tag to load the YouTube API. This is fragile and doesn't handle SSR correctly.

### Section 2: Code Quality Review

**DRY Violations:**
1. **Duplicate Header components** — `components/Header.tsx` and `components/layout/Header.tsx` both exist with different implementations. The layout version is used; the root version is dead code.
2. **Duplicate Footer logic** — Footer content is in `components/layout/Footer.tsx` but the PRD-specified links (Privacy, Terms) aren't connected.
3. **Supabase client creation** — Both `lib/supabase/server.ts` and the Inngest function create clients differently. Should be unified.

**Naming Issues:**
- `video_uuid` vs `videoId` — mixing naming conventions (snake_case vs camelCase) in the API route
- `requestId` overloaded — Used as both the actual UUID sent to the client and the route parameter (analysis ID), which is confusing

**Complexity Concerns:**
- `app/watch/[id]/page.tsx` at 424 lines is the largest file. It handles data fetching, YouTube player lifecycle, transcript sync, and UI rendering. Should be split into smaller components.

### Section 3: Test Review

**Test Coverage Analysis:**

| File | Tests | Coverage |
|---|---|---|
| `app/page.tsx` (Home) | 5 test files (page, hero, form, input, features) | ✅ Good |
| `app/watch/[id]/page.tsx` (Watch) | 6 test files (page, player, insights, info, sidebar, transcript) | ✅ Good |
| `lib/youtube/parser.ts` | 1 test file | ✅ Adequate |
| `lib/db/` (Supabase) | 4 test files (client, crud, setup, types) | ✅ Good |
| `app/api/analyze/route.ts` | 1 test file | ⚠️ Minimal |
| `app/api/analyses/[id]/route.ts` | No test | ❌ Missing |
| `app/api/videos/[id]/route.ts` | No test | ❌ Missing |
| `lib/ai/service.ts` | No test | ❌ Missing |
| `lib/ai/gemini.ts` | No test | ❌ Missing |
| `lib/inngest/functions.ts` | No test | ❌ Missing |
| `scripts/analysis-worker.ts` | No test | ❌ Missing |

**Test Gaps:**
1. **No API route tests for analyses/[id] or videos/[id]** — The two read-only API routes have zero test coverage
2. **No AI service tests** — The adapter pattern and fallback logic is completely untested
3. **No Inngest function tests** — The core business logic (analysis pipeline) has no tests
4. **No integration tests** — Despite issue 08 being "integration testing," no end-to-end tests exist
5. **No error path tests** — API tests (`__tests__/app/api/analyze.test.ts`) only test happy path. No 400/500 error tests.

**Tests that need to exist:**
- `app/api/analyses/[id]` — 404 for missing ID, 200 with data, correct JOIN with videos
- `app/api/videos/[id]` — 404 for missing ID, 200 with analyses, sorting
- `lib/ai/service.ts` — Fallback from Gemini to MiniMax on 429/503/401/403/timeout
- `lib/ai/gemini.ts` — API error handling, empty response handling, markdown fence stripping
- `lib/inngest/functions.ts` — Step execution order, error handling, data transformation
- Error boundary component — Renders fallback UI on crash

### Section 4: Performance Review

**Concerns:**
1. **No caching** — Every page load re-fetches from Supabase. No SWR, no React Query, no cache headers.
2. **No image optimization** — YouTube thumbnails are loaded directly without Next.js Image optimization.
3. **Polling overhead** — The watch page polls `/api/analyses/[id]` repeatedly during processing. No exponential backoff.
4. **Large initial JS bundle** — The watch page loads the YouTube IFrame API, which adds ~1MB+ to the client bundle.
5. **No code splitting** — All components are imported statically. The watch page could be lazy-loaded.

### Failure Modes Registry

| # | Failure Mode | Detection | User Impact | Mitigation | Tested? |
|---|---|---|---|---|---|
| F1 | Gemini API down | Inngest retry (3x) | Analysis fails | MiniMax fallback (broken — mock) | ❌ |
| F2 | YouTube API down | Error in getYouTubeVideoDetails | Falls back to basic metadata | Default thumbnail + "Unknown Channel" | ❌ |
| F3 | Transcript unavailable | youtube-transcript throws | Empty transcript | Returns empty array | ❌ |
| F4 | MiniMax is a mock | N/A | Fake data delivered | None — silent failure | ❌ |
| F5 | Supabase unavailable | API returns 500 | White screen | None — no error boundary | ❌ |
| F6 | Analysis timeout | Inngest step timeout (default 60s) | Analysis fails | Retry (3x) | ❌ |
| F7 | User pastes invalid URL | Client-side validation | 400 error | isValidYouTubeUrl check | ⚠️ Partial |
| F8 | Video not found on YouTube | YouTube API returns empty | Error page | Basic metadata fallback | ❌ |

**Critical Gap:** F4 — The MiniMax provider is a mock. If Gemini fails completely, users silently get fake chapter data instead of an error. This is a data integrity issue.


---

## Phase 3: Eng Review — Dual Voices (Claude primary, Codex unavailable for eng phase)

*Note: The Eng phase runs as single-reviewer since we're running autonomously. The CEO dual voice already surfaces the strategic concerns that would feed into Eng review.*

### ENG DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Architecture sound?               ⚠️      N/A     SINGLE — Adapter pattern good, `any` types bad
  2. Test coverage sufficient?         ❌      N/A     SINGLE — Core logic (AI, Inngest) untested
  3. Performance risks addressed?      ❌      N/A     SINGLE — No caching, no optimization
  4. Security threats covered?         ⚠️      N/A     SINGLE — RLS too permissive, no auth
  5. Error paths handled?              ❌      N/A     SINGLE — 4 untested failure modes
  6. Deployment risk manageable?       ⚠️      N/A     SINGLE — Inngest good, dead code bad
═══════════════════════════════════════════════════════════════

---

## Phase 3.5: DX Review — SKIPPED
**Reason:** WatchKey is an end-user consumer product. The API routes are internal, not developer-facing. No SDK, CLI, or developer onboarding docs exist or are planned.

---

## Cross-Phase Themes

**Theme 1: Mock/fictional components shipped as production code**
- Flagged in: Phase 1 (MiniMax mock), Phase 3 (Inngest uses string chapters)
- High-confidence signal: Two phases independently identified that the system appears to work but core functionality is faked.

**Theme 2: No authentication despite freemium model dependency**
- Flagged in: Phase 1 (auth + rate limiting), Phase 3 (RLS too permissive)
- High-confidence signal: The monetization model requires auth. Building without it means the first deployment has no way to limit usage.

**Theme 3: Mobile/responsive design absent**
- Flagged in: Phase 1 (not in scope for responsive), Phase 2 (3/10 responsive score)
- High-confidence signal: YouTube is consumed predominantly on mobile. A desktop-only video tool has a fundamental UX gap.

**Theme 4: No real-time feedback for the core wait experience**
- Flagged in: Phase 1 (polling only), Phase 2 (no progress indication), Phase 3 (polling overhead)
- High-confidence signal: The 2-minute analysis IS the product. Users need progress feedback.

---

## NOT IN SCOPE (deferred to TODOS.md)

| Item | Deferred From | Rationale |
|---|---|---|
| User authentication (Supabase Auth) | Phase 1 | MVP works without it, but must be added before monetization |
| Rate limiting / usage tracking | Phase 1 | Requires auth first |
| Payment integration (Stripe) | Phase 1 | Phase 2 feature |
| MiniMax integration | Phase 3 | Not a blocker — can integrate later |
| Responsive design | Phase 2 | MVP desktop-first, mobile follow-up |
| AI Chat feature | PRD Phase 2 | Explicitly excluded from MVP |
| Notes feature | PRD Phase 2 | Explicitly excluded from MVP |
| Browser extension | 12-month vision | Not in current scope |

---

## WHAT ALREADY EXISTS (sub-problem → code mapping)

| Sub-Problem | File(s) | Status |
|---|---|---|
| YouTube URL validation | `lib/youtube/parser.ts` | ✅ Complete |
| YouTube metadata fetching | `lib/youtube/service.ts` | ✅ Complete with fallback |
| Transcript fetching | `lib/youtube/service.ts` | ✅ Complete with proxy |
| AI provider interface | `lib/ai/provider.ts` | ✅ Clean adapter |
| AI fallback logic | `lib/ai/service.ts` | ✅ Complete |
| Gemini integration | `lib/ai/gemini.ts` | ✅ Complete |
| MiniMax integration | `lib/ai/minimax.ts` | ❌ Mock |
| Async processing | `lib/inngest/functions.ts` | ✅ Complete |
| Dead code worker | `scripts/analysis-worker.ts` | ⚠️ Should be deleted |
| DB schema | `supabase/migrations/0000_initial_schema.sql` | ✅ Complete |
| DB error column | `supabase/migrations/0002_add_error_to_analyses.sql` | ✅ Complete |
| Home page | `app/page.tsx`, `components/HeroForm.tsx` | ✅ Complete |
| Watch page | `app/watch/[id]/page.tsx` | ⚠️ Missing interactions |
| Header | `components/layout/Header.tsx` | ✅ Complete |
| Footer | `components/layout/Footer.tsx` | ⚠️ Missing nav links |
| Analysis API | `app/api/analyze/route.ts` | ✅ Complete |
| Polling API | `app/api/analyses/[id]/route.ts` | ✅ Complete |
| Video API | `app/api/videos/[id]/route.ts` | ✅ Complete |
| Privacy/Terms pages | `app/privacy/page.tsx`, `app/terms/page.tsx` | ✅ Complete |
| shadcn/ui components | `components/ui/*.tsx` | ✅ Button, Card, Input, Accordion, etc. |
| Database types | `types/database.types.ts` | ✅ Complete |

---

## Implementation Tasks (aggregated)

1. **[P1] Integrate MiniMax provider** — Replace mock with actual API call
   - Surfaced by: Phase 1, Phase 3 — `lib/ai/minimax.ts`
   
2. **[P1] Delete dead code worker** — Remove `scripts/analysis-worker.ts`
   - Surfaced by: Phase 1, Phase 3

3. **[P1] Add Supabase Auth** — Implement user authentication before monetization launch
   - Surfaced by: Phase 1

4. **[P1] Add rate limiting** — Implement daily analysis limit (3/day for free users)
   - Surfaced by: Phase 1

5. **[P2] Implement responsive design** — Make Watch page mobile-friendly
   - Surfaced by: Phase 2 — `app/watch/[id]/page.tsx`

6. **[P2] Add chapter click-to-seek** — Connect chapter clicks to YouTube player seekTo
   - Surfaced by: Phase 2 — `app/watch/[id]/page.tsx`

7. **[P2] Add loading/empty states** — Skeleton loaders, empty chapter state, error states
   - Surfaced by: Phase 2 — `app/watch/[id]/page.tsx`

8. **[P2] Fix chapter data model** — Store chapters as structured JSON, not formatted strings
   - Surfaced by: Phase 1 (Codex), Phase 3 — `lib/inngest/functions.ts:49-55`

9. **[P2] Add real-time progress** — Replace polling with SSE or WebSocket for analysis progress
   - Surfaced by: Phase 1, Phase 2, Phase 3

10. **[P3] Add test coverage for core logic** — AI service, Inngest function, API routes
    - Surfaced by: Phase 3

11. **[P3] Replace `any` types** — Add proper TypeScript types to watch page
    - Surfaced by: Phase 3 — `app/watch/[id]/page.tsx`

12. **[P3] Remove duplicate Header component** — Delete `components/Header.tsx`
    - Surfaced by: Phase 2, Phase 3


---

## /autoplan Review Complete

### Plan Summary
WatchKey is a YouTube video AI analysis tool. The dev branch implements a full MVP with Next.js 15, Supabase, Gemini AI, Inngest async processing, and YouTube-style UI. 15 commits, 95 files changed, ~21K lines added. The implementation is substantially complete for an MVP but has critical gaps in authentication, responsive design, and test coverage.

### Decisions Made: 12 total (12 auto-decided, 0 taste choices, 0 user challenges)

### Review Scores
- **CEO:** 3/6 critical issues (MiniMax mock, no auth, no rate limiting), 3/6 high issues
- **CEO Voices:** Codex 8 strategic blind spots, Claude 8 technical/strategy issues, Consensus 2/6 confirmed
- **Design:** 4/10 average score. Responsive design 3/10, Accessibility 2/10, Missing States 3/10
- **Eng:** Architecture 5/10, Test Coverage 3/10, Performance 3/10, Error Handling 3/10
- **DX:** Skipped — no developer-facing scope

### Cross-Phase Themes (4 high-confidence signals)
1. Mock/fictional components shipped as production code
2. No authentication despite freemium model dependency
3. Mobile/responsive design absent
4. No real-time feedback for the core wait experience

### Deferred to TODOS.md
- User authentication (Supabase Auth)
- Rate limiting / usage tracking
- Payment integration (Stripe)
- Responsive design
- AI Chat feature (Phase 2)
- Notes feature (Phase 2)

