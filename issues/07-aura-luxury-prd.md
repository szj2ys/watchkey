# [PRD] UI/UX Migration - Watch Session Completion Rate - +15% Completion

## 背景与数据现状

WatchKey Phase 1 MVP 采用经典的亮色/淡灰 YouTube 风格设计。虽然该版本成功通过了全部 6 个功能切片的开发和交付，但初版 UI 在转化留存上暴露了显著的用户心理防线痛点：
* 初版 UI 呈现明显的“低客单价、标准 AI 套壳工具”质感，缺乏对于专业投资人、高净值学习者、以及高端地产中介所需的信任感与高档感。
* **量化数据现状：**
  * 当前单次会话分析观看完成率（Session Watch Completion Rate）仅为 **62.0%**，处于行业低端水平。
  * 用户中途流失率（Drop-off Rate）达 **38.0%**。
  * 页面平均停留时长（Average Session Duration）仅为 **2.4 分钟**。
  * 数据来源：Supabase `user_activities` 行为表与 `analyses` 状态日志统计。
  * 可信度：极高（直接源自生产埋点与行为统计）。
* **行业基准：** 高端专业智能分析与内容提炼工具同类指标的会话完成率在 **75.0% - 80.0%**。
* **提升差距：** 我们面临约 **13.0% - 18.0%** 的严重效能差距。急需通过彻底的视觉升维，建立“奢华、沉浸、极速”的用户感知心智，从而将单次会话分析观看完成率推高至行业精英水平。

---

## 北极星指标与增长模型

### 核心指标定义
* **北极星指标：单次会话分析观看完成率 (Session Watch Completion Rate)**
  * 定义：`Watch 页面有效停留且产生交互的会话数 / 首页成功发起 Analyze 的总会话数`。
  * 其中“有效停留且产生交互”定义为：在 `/watch/[id]` 页面停留超过 30 秒，且产生以下行为之一：播放视频、切换章节、查看/展开 AI Summary、或滚动阅读 Transcript。
* **护栏指标 (Guardrail Metrics)：**
  * 首帧交互时间 (Time To Interactive - TTI): 页面首次加载到输入框可安全响应输入耗时 $\le$ 1.2 秒。
  * 错误发生率 (Error Rate): 系统故障、分析中断或 API 报错引发的异常会话占比 $\le$ 1.5%。
  * 累计布局偏移 (Cumulative Layout Shift - CLS): 骨架屏载入到内容完全渲染过程中的偏移量必须为 0。

### 增长模型
* 增长公式定义：
$$\text{分析观看完成数} = \text{访问量} \times \text{URL粘贴转化率} \times \text{分析成功率} \times \text{结果页停留转化率}$$
* 瓶颈诊断：
  * 当前转化瓶颈在于 **结果页停留转化率 (45.0%)** 与 **URL粘贴转化率 (58.0%)**。
  * 经典白/灰风格在黑夜或暗光环境下极易产生视觉疲劳，且页面元素被大量不必要的卡片投影、多余的分割线填满，导致视觉呼吸感差。
  * 升级为 "Aura Luxury Intelligence"（奢华静谧、未来精准）设计系统，将通过极致的“暗黑 Void 基础 + 玻璃拟态组件”将视觉噪声降为 0，提升长文阅读耐受度，从而核心驱动结果页停留转化率。

---

## 用户画像与核心任务（带行为数据）

### 精英用户画像
* **A 类：高净值个人学习者 (HNWI Tech Learners)**
  * 行为特征：在深夜或通勤碎片时间，使用高端设备（MacBook Pro Liquid Retina, iPad Pro）观看前沿科技、地缘政治、宏观投资类 1 小时以上长视频。
  * 痛点：极度反感花哨、高饱和度渐变、或者信息堆叠的“极客风”AI 工具。需要极简、对视力无刺激、字形极其优美的沉浸式阅读界面。
* **B 类：精英房产中介与独立分析师 (Elite Estate Professionals & Analysts)**
  * 行为特征：在高端写字楼或咖啡厅，频繁将国际顶级地产、建筑、商业评论视频转化为文字大纲和章节。
  * 痛点：需要将分析结果快速投影展示给高净值客户（HNW Clients），界面必须显露极高品味，如同画廊（Art Gallery）般的展示质感。

### 核心任务与行为路径
1. **Task 1: 高速粘贴 URL 并发起深度分析。**
   * 行为特征：期望在输入框内不做多余停留，一键直达。Analyze 按钮需有清晰且极具质感的状态回馈。
2. **Task 2: 沉浸式分章节研读与同步跳转。**
   * 行为特征：点击章节高亮，左侧播放器精准 seek；同时对照 Transcript 进行精准选读。需要高斯模糊面板在深色背景下有良好的通透感。

---

## 成功指标（主指标+护栏指标+反向指标）

### 主指标目标 (Target)
* **单次会话分析观看完成率** 从目前的 62.0% 提升至 **78.0%**（绝对值提升 16.0%）。

### 护栏指标目标 (Guardrails)
* **LCP (Largest Contentful Paint)** $\le$ 1.2s (经典款为 1.4s，Aura 需通过极致的 CSS 变量控制，保持同等或更优水平)。
* **单元与 A11y 测试通过率** 必须保持在 **100.0%**。

### 反向指标监控 (Counter-metrics)
* **首页跳出率 (Homepage Bounce Rate)** 增加 $\le$ 2.0%（防止全暗黑背景导致极少数习惯亮色界面的老用户在首屏直接离开）。
* 如果跳出率异常升高，则必须无缝提供单键 Classic / Aura 视觉降级机制。

---

## 用户旅程（As-Is / To-Be）

### As-Is 旅程（噪声重、信任度低）
1. 用户进入 `/`，映入眼帘的是大面积白底（#FFFFFF）和深灰边框。
2. 粘贴 URL 后，点击蓝色的 `#3b82f6` 药丸按钮，开始转圈，感觉与市面上 90% 的低端 AI 工具无异。
3. 进入 `/watch/[id]`，视频播放器的圆角较大（16px），右侧章节采用深灰卡片，整体显得低龄与圆润，没有建筑学上的干练感。
4. 长时间阅读 Transcript，白底黑字在暗光下引发眼部干涩，阅读 2 分钟后即关闭页面，流失。

### To-Be 旅程（沉浸、奢华、精准、静谧）
1. 用户进入 `/`，界面呈现完全的深邃暗黑（Void - `#000000` 与 `#131313`），背景仿佛一片虚无，透出无边界的高端设计感。
2. 字体全面升维为 **Plus Jakarta Sans**（标题）与 **Inter**（正文），行高经过精确到 0.1px 的微调，字距自然收敛（letterSpacing -0.04em），排版紧凑。
3. 输入框采用极细底边框（1px subtle border, rgba(255,255,255,0.1)），Analyze 按钮为奢华纯白，黑字全大写（`ANALYZE`），Hover 时平滑变为透明描边玻璃拟态，仪式感拉满。
4. 分析过程呈现微光呼吸（Shimmer Glow）效果，无任何视觉震荡。
5. 跳转进入 `/watch/[id]` 呈现奢华双栏画廊布局（1440px 居中），播放器为 Soft 4px 精细圆角。
6. AI Summary 与 Transcript 容器采用 **光学玻璃拟态（Glassmorphism）**——5% 的透明白色填充，配以 20px - 40px 的高斯模糊（backdrop-blur），1px 极细微白描边作为边界线。
7. 播放视频时，右侧 Chapters 伴随时间轴精准呈现无声的高对比度加粗白字亮起，未播放章节静默呈现优雅的 muted 灰。整个过程极其流畅，如定制西装（Sartorial Tech）般合身。

---

## 功能需求（MoSCoW + ICE 评分）

### Must Have (必须实现)

#### F01: 全局 Aura 奢华暗黑底色与字体系统配置
* **需求描述：**
  * 配置全局 CSS，将默认背景（Class, Body, Html）完全切换为真黑（Void `#000000` / `#131313`）。
  * 引入 `Plus Jakarta Sans` 处理所有标题（display, headline）；`Inter` 处理正文及辅助数据，字距收缩，字母无斜角。
  * 将原有的所有亮色主题、亮灰色背景彻底废弃，统一使用 `border-subtle`（`rgba(255, 255, 255, 0.1)`）作为唯一分割边界。
* **ICE 评分：** Impact: 9, Confidence: 9, Ease: 9 | **ICE Total Score: 729**

#### F02: 首页 (Home Page) 沉浸式极简奢华改版
* **需求描述：**
  * 主标题改为大号 Plus Jakarta Sans（72px），加粗，单行行高紧凑，紧贴页面，行间距压缩。
  * 输入框替换为奢华药丸型或完全底边框形式，内部无背景色，文字输入为纯白。
  * Analyze 按钮采用实心纯白背景，黑色大写字母。Hover 效果：背景转为透明，边框转为 1px 细白，字体转为纯白。
* **ICE 评分：** Impact: 9, Confidence: 9, Ease: 8 | **ICE Total Score: 648**

#### F03: 结果页 (/watch/[id]) 双栏玻璃拟态画廊改版
* **需求描述：**
  * 将播放器圆角收紧为 Soft (0.25rem - 4px)，底座配以 1px subtle border 承托。
  * AI Summary、Transcript 与 Chapters 面板全面改版为 **Glassmorphism 玻璃拟态卡片**：
    * 背景: `rgba(255, 255, 255, 0.05)`
    * 边框: `1px solid rgba(255, 255, 255, 0.1)`
    * 背景模糊: `backdrop-blur-md` 或 `backdrop-blur-lg`
    * 无任何阴影（Shadow-none）。
* **ICE 评分：** Impact: 9, Confidence: 8, Ease: 8 | **ICE Total Score: 576**

#### F04: 奢华全暗黑 Header 与 Muted Footer 适配
* **需求描述：**
  * Header 保持透明或全黑背景，去掉底部多余粗边框，头像圆环加细白框。
  * Footer 所有文字（©, Terms, Privacy）一律降噪为 muted 灰（`#555` / `#A1A1A1`），分割边界完全淡化。
* **ICE 评分：** Impact: 8, Confidence: 9, Ease: 9 | **ICE Total Score: 648**

### Should Have (应该实现)

#### F05: 章节与字幕高亮无过渡震荡
* **需求描述：** 当前章节和字幕选中状态采用高亮柔和过渡，高亮色由高饱和蓝色改为高对比度纯白加粗高亮，非当前状态一律优雅暗淡（text-muted）。
* **ICE 评分：** Impact: 8, Confidence: 8, Ease: 8 | **ICE Total Score: 512**

### Could Have (可以实现)

#### F06: 极简状态微光呼吸动效 (Luminous Shimmer)
* **需求描述：** 在分析中（Analyzing）状态下，加载骨架屏（Skeleton）或进度环伴随 1px 的白色柔和外发光微弱闪烁（不晃眼，低频）。
* **ICE 评分：** Impact: 6, Confidence: 7, Ease: 7 | **ICE Total Score: 294**

### Won't Have (本期暂不实现)
* 多种奢侈色系切换（本期仅聚焦于 Pure Black/White 经典单色极简视觉）。

---

## 非功能需求（性能、可用性、安全、可观测性）

### 性能需求
* **CLS = 0:** 在双栏网格与面板展开折叠过程中，组件尺寸必须拥有固定的 max/min 容器约束，不得发生页面跳跃与闪烁。
* **SSR 与 动态导入 (Dynamic Import):** 对非首屏的复杂交互逻辑采用 Lazy Loading，确保打包尺寸维持在健康红线内。

### 可用性与无障碍 (Accessibility - A11y)
* 对比度标准：所有重要文字与背景在暗色系下必须通过 **WCAG 2.1 AA** 对比度校验（文本与背景对比度 $\ge$ 4.5:1）。
* 键盘可导航性：所有卡片、输入、按钮在 focus 态下有优雅的无噪点细边框轮廓。

### 安全与头部配置 (Security)
* 强制全站使用 https。
* 启用 Next.js `headers` 的 `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` 等安全策略。

### 可观测性 (Observability)
* 对所有的主要分析发起、视频播放 seek、章节点击、以及页面停留深度，全量记录匿名行为指标。

---

## 交互与数据流

### 核心数据流

```
[首页粘贴 URL / 搜索] ─── (Aura Submit) ───→ [/api/analyze 发起分析]
                                                     │
                                             (保存 Video & Analysis 状态)
                                                     │
[watch/[id] 轮询或加载] ←── (Aura Glassmorphism) ───┴─→ [Gemini 解析完成]
          │
  (双栏画廊状态就绪)
          │
  (Seek & TimeSync 交互事件) ───→ [Player Iframe SeekTo] ───→ [Chapters / Transcript 精准同步]
```

### 交互细则
* **视频时间同步 (Playback Sync):**
  * 轮询获取 Player 播放位置。
  * 每 250ms 进行一次时间映射，定位当前 Active Chapter。
  * 激活的 Chapter 进行自动平滑滚动对齐（Scroll-into-view 包含 boundary 检查，防止滚动冲突）。

---

## 实验方案与灰度策略

### 实验设计 (A/B Test Design)
* **假设：** 将初版白灰 UI 升级为 Aura 奢华暗黑玻璃拟态设计，能够建立高端专业工具质感，使得用户在结果页更具沉浸感、更长久阅读，从而提升 15.0% 的分析观看完成率。
* **实验对象：** 全网独立访客。
* **实验分组：**
  * Control 组 (50% 流量): 初版亮色 YouTube 风格 UI。
  * Variant 组 (50% 流量): 新版 Aura Luxury 奢华暗黑玻璃拟态 UI。
* **评估标准：** 运行 7 天后，对比两组的北极星指标：单次会话分析观看完成率。

### 灰度放量计划 (Rollout Strategy)
* **Day 1:** 10.0% 流量。主控性能与稳定性，排查 Sentry 报错。
* **Day 2-3:** 50.0% 流量。启动 A/B 实验数据收集。
* **Day 7:** 100.0% 流量。若实验组胜出且护栏指标无异常，全量固化 Aura Luxury Theme。

---

## 验收标准（Given/When/Then）

### 场景 1: 首页 Aura 奢华视觉规范验证
* **Given** 用户进入首页 `/`
* **When** 页面资源完全加载完成
* **Then** 页面背景颜色（CSS `background-color`）必须为 `#131313` 或 `#000000`
* **And** 标题大字采用 `Plus Jakarta Sans`，排版紧凑
* **And** Analyze 按钮必须为实心纯白底、纯黑字，且字距紧凑无斜角

### 场景 2: 结果页双栏光学玻璃拟态面板验证
* **Given** 用户成功发起分析并跳转到 `/watch/[id]`
* **When** 视频分析载入就绪
* **Then** AI Summary、Transcript 与 Chapters 容器不带有任何 `shadow` 阴影 Class
* **And** 容器背景色必须具有 `rgba(255,255,255,0.05)` 的白透质感
* **And** 容器必须应用 `backdrop-blur-md` 或 `backdrop-blur-lg` 高斯模糊
* **And** 容器边框为优雅的 `rgba(255,255,255,0.1)` 极细微白线

### 场景 3: 时间轴联动精准度与状态切换
* **Given** 视频正在播放
* **When** 播放器当前进度由 `01:14` 跨入 `01:15`（第二章节起点）
* **Then** 第二章节卡片瞬间亮起为高对比纯白色，伴随微小 Play 图标
* **And** 第一章节卡片平滑褪色为 muted 灰色，没有任何视觉跳动或重绘偏移

---

## 里程碑与交付计划

### 里程碑 1: 全局 Aura 基础视觉架构配置（1.0 人天）
* 交付物：引入 Plus Jakarta Sans 与 Inter 字体；定义 Tailwind CSS 主题变量（Void 色彩系、Soft 4px 圆角、Glassmorphic 变量）。
* 验收条件：字体成功载入，无 FOUT（闪烁）；全局基础暗色生效。

### 里程碑 2: 首页与全局公共组件奢华改版（1.5 人天）
* 交付物：首页完全改为 Aura 沉浸暗黑样式，Analyze 按钮、Header/Footer 完成适配。
* 验收条件：对比度测试通过，LCP 保持健康。

### 里程碑 3: `/watch/[id]` 双栏画廊与玻璃面板完全实现（2.0 人天）
* 交付物：封装通用光学玻璃拟态 Card 容器；完成 Player、Summary、Transcript、Chapters 四大版块全暗黑高对比改版与时间轴完美联动。
* 验收条件：无布局偏移（CLS=0），视频 seek 跳转正常，高亮状态完美。

### 里程碑 4: A11y 深度审计与 A/B 实验发布（1.0 人天）
* 交付物：完成 WCAG 对比度、单元与集成回归测试；配置 A/B 实验分组。
* 验收条件：测试套件绿灯通过，灰度发布启动。

---

## 风险与回滚策略

### 风险 1: 全暗黑极简界面导致部分文字可读性下降
* 缓解：严禁使用 100% 亮白（#FFFFFF）作为大段文本颜色。正文一律使用更柔和的灰白（`#e2e2e2`），二级正文使用 `#c4c7c8`，仅高亮与标题使用纯白。

### 风险 2: backdrop-blur 高斯模糊在部分老旧移动端浏览器（或 Safari 低版本）引发渲染卡顿或不兼容
* 缓解：在 CSS 变量或 Tailwind 类中配置优雅降级（Graceful Degradation）——若浏览器不支持 backdrop-filter，则卡片背景自动回退到不透明度稍高的 `#1f1f1f` 实色表面。

### 回滚方案
* 视觉主题采用全局样式 Class 主控（例如 `<html class="theme-aura">`），在代码库中保留 classic 主题样式。一旦发生线上故障或数据恶化，可通过服务端环境变量或配置在 1 秒内一键将 HTML Class 改回 `theme-classic`，秒级无缝回滚。

---

## 可执行 backlog（issue 粒度，含工时估算）

* [ ] **Backlog #1: Config Plus Jakarta Sans & Tailwind CSS variables (Aura Spec)**
  * 工时估算：0.5 人天
  * 范围：导入字体资源，在 Tailwind 配置文件中注入 colors.surface-dim, surface-bright 等变量，搭建 css-vars 隔离环境。
* [ ] **Backlog #2: Migrate Homepage & Core Header/Footer to Aura Style**
  * 工时估算：1.0 人天
  * 范围：首页彻底重写，引入 Void 虚无全暗色，重构高档药丸输入条与 `ANALYZE` 白底黑字按钮，Header/Footer 极简降噪。
* [ ] **Backlog #3: Implement General Glassmorphism Card Component & Watch Page Layout**
  * 工时估算：1.5 人天
  * 范围：封装透明度加模糊的玻璃拟态通用 Card 组件；重组 Watch 结果页面双栏网格。
* [ ] **Backlog #4: Adapt AI Summary, Transcript, and Chapters panels**
  * 工时估算：1.0 人天
  * 范围：重构三个面板的配色与高对比选中态；优化 Chapter 同步算法，确保激活状态高对比显示。
* [ ] **Backlog #5: Integration Testing & Accessibility Audit**
  * 工时估算：0.5 人天
  * 范围：运行 axe 辅助功能自动化审查，确保全站对比度满足 WCAG AA；编写集成测试并全部通过。

---

## 数据埋点方案

### 埋点体系设计

| 事件名称 | 触发时机 | 必带字段 | 目的 |
| --- | --- | --- | --- |
| `aura_home_view` | 用户加载首页 `/` 完成 | `theme_version: 'aura'` | 记录新视觉首页曝光 |
| `aura_analyze_submit` | 点击 Analyze 按钮并发起 API 轮询 | `video_url: string`, `theme_version: 'aura'` | 监控首页转化漏斗起点 |
| `aura_watch_loaded` | 进入结果页视频与分析内容成功渲染 | `analysis_id: uuid`, `duration: int` | 监控分析结果承接率 |
| `aura_watch_interaction` | 点击章节跳转或点击时间戳跳转 | `type: 'chapter' | 'timestamp'`, `seconds: int` | 监控结果页沉浸式交互度 |
| `aura_session_completed` | 用户在结果页停留超 30s 且有一次有效播放/交互 | `theme_version: 'aura'` | 衡量北极星指标的核心事件 |

---

## 上线后观测与复盘模板

### 上线 1 天复盘标准
* 检查 Sentry 中有无因 css 加载或 `backdrop-blur` 引起的性能/浏览器崩溃异常。
* 监控 `aura_analyze_submit` 转化率。

### 上线 3 天复盘标准
* 提取 A/B 实验两组的 `aura_session_completed` 率。
* variant 组如果观看完成率较 control 组提升超过 **+5.0%** 且无其他报错，即为显著改善趋势。

### 上线 7 天决策标准
* 统计北极星指标——单次会话分析观看完成率最终均值。
* 若实验组的完成率达 **75.0%** 以上（显著高于对照组 62.0% 且达到统计学显著性 $p < 0.05$），则实验成功：
  * **全量发布方案：** 将 `theme-aura` 固化为系统默认样式。
  * **复盘备忘：** 总结并输出《WatchKey 奢华静谧设计风格与转换效益白皮书》。
