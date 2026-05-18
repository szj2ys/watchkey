# WatchKey 需求澄清文档

## 1. 核心实体定义

### Video（视频）
- **定义**: YouTube 视频的不可变元数据引用
- **字段**: videoId, title, channel, duration, thumbnailUrl, status
- **状态**: pending_analysis → analyzing → analyzed | failed
- **关系**: 1个Video对应N个Analysis

### Analysis（分析）
- **定义**: AI生成的视频解析产物
- **字段**: topics[], highlights[], summary, quotes, transcript_segments, provider
- **历史**: 保留所有版本，用户可切换，最新成功版本标记为 is_default

### User
- **Library**: 用户的 Video 集合（去重），通过 user_videos 关联表实现多对多关系
- **Favorites**: 收藏的 Video，也是多对多关联

## 2. 核心用户流程

```
1. 粘贴 YouTube URL
   ↓
2. 系统提取 Video 元数据 → 创建 Video 记录（status: pending_analysis）
   ↓
3. 启动 Analysis
   ↓
4. 异步生成 AI 分析结果（显示进度条，支持 WebSocket 实时更新）
   ↓
5. 分析完成通知（浏览器通知 + 页面内提示）
   ↓
6. 进入 Video Workspace（播放器 + 话题卡片 + 摘要与字幕）
- 分析完成后进入 Workspace 查看结果


### 认证方案
- Supabase Auth 提供邮箱/密码 + OAuth（Google/GitHub）登录
- 匿名用户可使用，但数据仅保存在本地，登录后合并

## 3. 商业模式

### 消耗规则
- 每次分析消耗固定额度
- 订阅用户不限次数，但有公平使用限制（防滥用）
- 每日限额按 UTC 0 点重置

### 免费用户
- 每日 3 次分析限额
- 基础 AI 模型
- 标准队列

### 付费用户
- **订阅制**: 月度/年度，无限分析 + 优先队列
- **点数购买**: 一次性，按需消耗
- Stripe 支付，Supabase 记录交易

### 缓存策略
- Analysis 结果永久缓存（除非用户删除）
- YouTube 元数据缓存 7 天
- 字幕数据缓存 30 天

### 数据保留
- 用户删除 Video：级联删除关联的 Analysis（软删除保留 30 天后清理）

### 性能指标
- 分析时长目标：< 2 分钟
- 单视频上限：4 小时

## 4. 技术决策

### AI Provider 架构
- 适配器模式统一封装 MiniMax / xAI Grok / Google Gemini
- Provider 级别自动 fallback
- 模型配置集中管理

### 数据库设计
- Supabase PostgreSQL
- Video 表、Analysis 表、User 表、Usage 表

### 前端架构
- Next.js 15 App Router
- React 19 Server Components
- Tailwind CSS v4 + shadcn/ui
- 视频播放器：react-youtube 或自定义

## 5. 页面结构

```
/                    Landing Page（营销页）
/app                 主应用（需登录）
  /analyze           分析入口（粘贴 URL）
  /video/[id]        视频工作区（播放器 + AI 面板 + 笔记）
  /my-videos         视频库
  /all-notes         全局笔记本
  /settings          设置（偏好、订阅）
```

## 6. 关键交互设计

### Video Workspace 布局
- **左侧**: YouTube 播放器 + 字幕浏览 + 摘要折叠面板
- **右侧**: 话题卡片列表（Chapters） + Up Next 列表

### 话题卡片 (Chapters)
- 显示标题 + 时间范围 + 摘要
- 点击跳转到对应时间段

## 7. 差异化要点

1. **一键结构化长视频**
2. **极简 YouTube 风格体验，沉浸式观看**
3. **Freemium 的清晰边界**

## 8. Out of Scope

- 非 YouTube 视频支持
- 视频下载/导出
- 无字幕视频处理
