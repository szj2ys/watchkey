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
