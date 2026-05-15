# 星海未寄

原创日系恋爱养成 Galgame / ADV Web 游戏。当前版本完成第一章「雨后的空教室」：标题页、逐句语音对白、三位女主立绘、场景 BGM 切换、选择分支、好感与养成数值、3 段关键视频演出、路线种子和章节结尾。

## 运行

```bash
npm install
npm run dev
```

构建预览：

```bash
npm run build
npm run preview
```

## 验收

```bash
npm run test
npm run lint
npm run build
npm run e2e
```

`npm run e2e` 会启动本地预览并用 Playwright 跑桌面和移动端流程。首次运行如果本机没有 Playwright 浏览器，需要执行：

```bash
npx playwright install chromium
```

## 发布到 GitHub Pages

推荐仓库名：

```text
hoshiumi-miyori-galgame
```

发布后的地址格式：

```text
https://你的GitHub用户名.github.io/hoshiumi-miyori-galgame/
```

项目已经内置 GitHub Pages workflow：

```text
.github/workflows/pages.yml
```

GitHub 仓库里需要设置：

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

本地推送到 `main` 后，GitHub Actions 会自动构建并发布。

## 当前内容

- 作品名：《星海未寄》
- 第一章：雨后的空教室
- 核心钩子：转校第一天，主角收到一封写着“请在我消失前喜欢上真正的我”的匿名信。三位少女都像寄信人，但每接近一个人，另一段记忆就会被改写。
- 主要角色：
  - 白咲遥：学生会书记，手账里提前写着主角未说出口的话。
  - 七濑澪：轻音部主唱，唱的是恋歌，每一句都像告别。
  - 九条凛花：美术部王牌，画下别人忘掉的过去。
- 可玩流程：
  - 雨后校门收到第一封信。
  - 二年 B 班遇见遥与澪。
  - 雨后校门触发第一封信异常视频。
  - 放学后音乐教室触发澪的特殊视频演出。
  - 夜晚空教室触发第七封信终章视频。
  - 夜晚空教室选择第二章路线。

## 项目结构

```text
src/
  App.tsx
  game/
    content.ts              # 剧情、角色、场景、选择、音视频路径
    contentValidation.ts    # 内容完整性校验
    store.ts                # ADV 状态机、好感、数值、路线、存档
    types.ts
  styles/
    game.css                # Galgame 视觉、立绘层、对话框、响应式
  game/__tests__/           # 单元测试
e2e/
  main-flow.spec.ts         # 真实浏览器玩家流程
docs/
  workflow.md               # 后续协作流程
public/
  assets/
    backgrounds/            # 场景背景
    bgm/                    # 每场景 BGM
    characters/             # 角色立绘
    music/                  # 主题曲
    video/                  # 特殊场景视频：第一封信、澪的歌、第七封信
    voice/                  # 每句正式台词语音
AGENTS.md                  # 项目级 Codex / subAgent 指令
```

## 素材链路

- 主视觉、角色立绘、场景背景：使用 `imagegen` 生成，复制到 `public/assets/` 后由工程引用。
- 角色立绘：先生成纯色背景图，再用本地透明处理脚本转成可叠放 PNG。
- 视频：使用 Dreamina / 即梦 CLI 生成 5 秒关键演出视频，接入 `VideoEventLayer`。
- 语音：使用 MMX CLI 为每句正式对白生成独立 MP3。
- 主题曲与场景 BGM：使用 MMX CLI 生成，主题曲用于标题页，每个场景使用不同 BGM。

## 设计原则

- 所有角色、剧情、音乐提示词和美术提示词必须原创。
- 不复刻任何现有 Galgame、动漫、校园 IP、制服设计或角色设定。
- 第一章必须从标题页一路玩到明确结尾。
- 所有正式对白必须有 `audio` 字段和对应 `public/assets/voice/*.mp3`。
- 每个场景必须有独立 BGM，不再使用单一环境音糊底。
- 选择必须改变好感、养成数值、路线种子或剧情状态。
- 关键演出优先用视频或明确动画，不只用状态栏文字。
