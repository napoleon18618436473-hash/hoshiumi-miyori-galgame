# AGENTS.md

## Project Goal

本项目是原创日系恋爱养成 Galgame / ADV Web 游戏《星海未寄》。当前目标是把第一章「雨后的空教室」做成可运行、可测试、可继续扩章的成熟 Galgame 模板。

项目交付物必须是可玩的浏览器游戏，不是静态页面、设定集或素材堆叠。

## Product Scope

当前第一章范围：

- 标题页和章节入口
- ADV 分层对白
- 三位女主角色立绘
- 当前说话角色高亮
- 场景背景和场景 BGM
- 每句正式对白语音
- 恋爱养成数值
- 好感变化
- 关键选择分支
- 特定场景视频演出
- 第一章至少包含 3 个剧情必要视频点：第一封信、澪的歌、第七封信
- 章节结尾和第二章路线种子
- 桌面和移动端可玩布局

不在当前默认范围：

- 自动发布到任何平台
- 复刻任何现有 Galgame、动漫、校园 IP、制服、角色或音乐
- 引入重型游戏引擎，除非 React ADV 架构无法满足后续需求
- 未授权的商业素材、字体、音乐或角色形象

## Collaboration Model

默认采用「主会话调度 + subAgent 专项执行」。

推荐 subAgent 角色：

- Game Design：剧情、人物、选择、好感、路线结构
- Visual/UI：角色立绘、背景、对话框、响应式、截图验收
- Audio：MMX 语音、主题曲、BGM、ffprobe 校验
- Video：Dreamina / 即梦视频提示词、提交、下载、接入
- Implementation：React 组件、Zustand 状态机、内容配置
- QA：单元测试、Playwright、媒体文件校验、移动端检查
- Delivery：README、workflow、交付摘要、剩余风险

主会话负责拆解、分派、整合、冲突解决和最终验收。

## Architecture Rules

- `src/game/content.ts` 存作品名、角色、场景、对白、选择、音频、BGM、视频事件。
- `src/game/store.ts` 存 ADV 状态机、好感、养成数值、路线种子、存档和动作。
- `src/game/contentValidation.ts` 存可单独测试的内容完整性规则。
- `src/App.tsx` 只做组件组合、播放绑定和交互绑定，不把核心剧情状态散落到本地 state。
- `src/styles/game.css` 负责 Galgame 视觉、立绘层、对话框、选择面板和响应式。
- e2e 测试必须优先使用稳定的 `data-testid`。

## Content Rules

- 所有标题、角色、剧情、选择和音乐歌词必须原创。
- 日系恋爱风格要靠人物关系、选择代价、情绪反转和演出节奏成立，不靠擦边或低龄化角色吸引。
- 所有角色默认为高中年龄段，画面和台词必须保持健康、非性化。
- 每条正式对白必须有 `audio` 路径，并且 `public/assets/voice/` 中必须存在对应音频。
- 每个场景必须有独立 BGM。
- 主题曲只在标题页、章节结尾或 OP 演出中使用，不替代场景 BGM。
- 选择必须改变至少一个明确状态：好感、勇气、灵感、信赖、flag、routeSeed 或视频事件。
- 关键演出必须有可见反馈，优先使用视频、立绘变化、背景变化、音效或短动画。
- 对话采用 Galgame / ADV 分层：背景图、人物立绘、对话框、选择面板分别渲染；人物立绘不得塞进对话框头像位。
- 当前说话角色必须高亮，非当前角色压暗。

## Quality Bar

任何新增章节或大玩法必须满足：

- 能从标题页或章节入口玩到明确结尾
- 至少补一个单元测试
- 至少补一个 Playwright 主流程测试或扩展现有流程
- 有至少一个选择分支影响状态
- 关键剧情对白有文字和语音
- 每个场景有独立 BGM
- 关键演出有视频或明确动画
- 移动端布局可用
- `npm run test`
- `npm run lint`
- `npm run build`

涉及浏览器交互、响应式或完整流程时，还要跑：

```bash
npm run e2e
```

媒体产物还要用 `ffprobe` 验证可读。

## Tooling

当前技术栈：

- Vite
- React
- TypeScript
- Zustand
- Howler
- Vitest
- Playwright

素材和插件约定：

- 角色、背景、主视觉优先用 `imagegen`，必须复制到 `public/assets/` 后再引用。
- 视频素材使用 Dreamina / 即梦 CLI，单段优先 5 秒，记录 prompt 和任务结果。
- 主题曲、BGM、语音使用 MMX CLI，生成后用 `ffprobe` 验证。
- 当前游戏实时 UI 动效优先用 React/CSS；宣传片或复杂镜头再进入 HyperFrames / Remotion。

可以新增依赖，但必须满足：

- 明确解决当前问题
- 不引入无关复杂度
- 不使用未知来源或未授权素材
- 新增依赖后更新 README 或相关文档

## Delivery Checklist

交付前检查：

- 游戏能运行
- 玩家流程完整
- 所有正式对白有语音
- 每个场景 BGM 不同
- 视频触发能播放或明确说明 provider 阻塞
- 测试和构建结果明确
- 文档更新
- 没有把未验证结果说成已验证
- 没有覆盖或删除用户无关改动
