import clsx from 'clsx'
import { Howl, Howler } from 'howler'
import { useEffect, useMemo } from 'react'
import { characters, chapterTitle, gameTitle, scenes, themeSong } from './game/content'
import { getCurrentScene, useGameStore } from './game/store'
import type { Choice, HeroineId } from './game/types'
import './styles/game.css'

const characterMap = Object.fromEntries(characters.map((character) => [character.id, character]))
const heroineNames: Record<HeroineId, string> = {
  haruka: '遥',
  mio: '澪',
  rinka: '凛花',
}

let bgmLoop: Howl | undefined
let bgmSrc = ''
let themeLoop: Howl | undefined
let voicePlayer: Howl | undefined

function unlockAudio() {
  void Howler.ctx?.resume?.()
}

function playVoice(src?: string, muted?: boolean) {
  voicePlayer?.stop()
  voicePlayer?.unload()
  voicePlayer = undefined

  if (!src || muted) {
    return
  }

  const voice = new Howl({
    src: [src],
    html5: true,
    volume: 1,
  })
  voicePlayer = voice
  voice.play()
}

function stopHowl(howl?: Howl) {
  if (howl?.playing()) {
    howl.fade(howl.volume(), 0, 360)
    window.setTimeout(() => howl.stop(), 380)
  }
}

function TitleScreen() {
  const startGame = useGameStore((state) => state.startGame)
  const resetGame = useGameStore((state) => state.resetGame)
  const muted = useGameStore((state) => state.muted)

  function handleStartGame() {
    unlockAudio()
    startGame()
    playVoice(scenes.schoolGate.dialogue[0]?.audio, muted)
  }

  return (
    <main className="title-screen love-title">
      <section className="title-art">
        <img src="/assets/ui/hoshiumi-title.png" alt="" />
        <div className="title-gradient" />
        <div className="love-title-copy">
          <span>Original Romance ADV</span>
          <h1>{gameTitle}</h1>
          <p>{chapterTitle}</p>
          <div className="title-actions">
            <button type="button" onClick={handleStartGame} data-testid="start-game">
              开始第一章
            </button>
            <button type="button" className="secondary" onClick={resetGame}>
              重置存档
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function AssetPreloader() {
  return (
    <div className="asset-preloader" aria-hidden="true">
      <img src="/assets/ui/hoshiumi-title.png" alt="" />
      {Object.values(scenes).map((scene) => (
        <img key={scene.background} src={scene.background} alt="" />
      ))}
      {characters
        .filter((character) => character.portrait)
        .map((character) => (
          <img key={character.id} src={character.portrait} alt="" />
      ))}
      <video src="/assets/video/mio-first-song.mp4" preload="metadata" />
      <video src="/assets/video/letter-first-rain.mp4" preload="metadata" />
      <video src="/assets/video/seventh-letter-classroom.mp4" preload="metadata" />
    </div>
  )
}

function useMusic() {
  const phase = useGameStore((state) => state.phase)
  const sceneId = useGameStore((state) => state.sceneId)
  const muted = useGameStore((state) => state.muted)

  useEffect(() => {
    if (!themeLoop) {
      themeLoop = new Howl({
        src: [themeSong],
        html5: true,
        loop: true,
        volume: 0.34,
      })
    }

    if (phase === 'title' && !muted) {
      stopHowl(bgmLoop)
      if (!themeLoop.playing()) {
        themeLoop.volume(0.34)
        themeLoop.play()
      }
      return
    }

    stopHowl(themeLoop)
  }, [muted, phase])

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'ending') {
      stopHowl(bgmLoop)
      return
    }

    const nextSrc = getCurrentScene(sceneId).bgm

    if (muted) {
      stopHowl(bgmLoop)
      return
    }

    if (bgmLoop && bgmSrc === nextSrc) {
      if (!bgmLoop.playing()) {
        bgmLoop.volume(0.3)
        bgmLoop.play()
      }
      return
    }

    stopHowl(bgmLoop)
    bgmSrc = nextSrc
    bgmLoop = new Howl({
      src: [nextSrc],
      html5: true,
      loop: true,
      volume: 0.3,
    })
    bgmLoop.play()
  }, [muted, phase, sceneId])
}

function DialogueBox() {
  const dialogue = useGameStore((state) => state.dialogue)
  const dialogueIndex = useGameStore((state) => state.dialogueIndex)
  const advanceDialogue = useGameStore((state) => state.advanceDialogue)
  const muted = useGameStore((state) => state.muted)
  const line = dialogue[dialogueIndex]

  useEffect(() => {
    playVoice(line?.audio, muted)
  }, [line?.audio, muted])

  if (!line) {
    return null
  }

  function handleAdvanceDialogue() {
    unlockAudio()
    const nextLine = dialogue[dialogueIndex + 1]
    if (nextLine) {
      playVoice(nextLine.audio, muted)
    }
    advanceDialogue()
  }

  return (
    <button
      type="button"
      className="dialogue-card love-dialogue"
      onClick={handleAdvanceDialogue}
      data-testid="dialogue-card"
    >
      <span className="speaker">{line.speaker}</span>
      <span className="dialogue-text">{line.text}</span>
      <span className="dialogue-hint">点击继续</span>
    </button>
  )
}

function CharacterLayer() {
  const sceneId = useGameStore((state) => state.sceneId)
  const dialogue = useGameStore((state) => state.dialogue)
  const dialogueIndex = useGameStore((state) => state.dialogueIndex)
  const scene = getCurrentScene(sceneId)
  const activeCharacter = dialogue[dialogueIndex]?.characterId
  const visibleCast = scene.cast
    .map((id) => characterMap[id]!)
    .filter((character) => character.portrait)

  return (
    <div className="character-layer visual-novel-cast" aria-label="人物立绘">
      {visibleCast.map((character, index) => {
        const fallbackPositions = ['left', 'center', 'right'] as const
        const linePosition = activeCharacter === character.id ? dialogue[dialogueIndex]?.position : undefined
        const position = linePosition || fallbackPositions[index] || 'center'
        return (
          <figure
            key={character.id}
            className={clsx(
              'character-sprite',
              `sprite-${position}`,
              activeCharacter === character.id ? 'active' : 'dimmed',
            )}
            data-testid={`vn-sprite-${character.id}`}
          >
            <img src={character.portrait} alt={character.name} />
          </figure>
        )
      })}
    </div>
  )
}

function ChoicePanel() {
  const sceneId = useGameStore((state) => state.sceneId)
  const dialogue = useGameStore((state) => state.dialogue)
  const dialogueIndex = useGameStore((state) => state.dialogueIndex)
  const selectChoice = useGameStore((state) => state.selectChoice)
  const hasDialogue = Boolean(dialogue[dialogueIndex])
  const scene = getCurrentScene(sceneId)

  if (hasDialogue) {
    return null
  }

  return (
    <section className="choice-panel" aria-label="选择" data-testid="choice-panel">
      {scene.choices.map((choice: Choice) => (
        <button
          type="button"
          key={choice.id}
          onClick={() => {
            unlockAudio()
            selectChoice(choice)
          }}
          data-testid={`choice-${choice.id}`}
        >
          <strong>{choice.text}</strong>
          <span>{choice.description}</span>
        </button>
      ))}
    </section>
  )
}

function StatPanel() {
  const stats = useGameStore((state) => state.stats)
  const affection = useGameStore((state) => state.affection)
  const routeSeed = useGameStore((state) => state.routeSeed)

  return (
    <aside className="stat-panel" aria-label="养成数值">
      <div className="panel-heading">
        <strong>养成</strong>
        <span>{routeSeed ? `${heroineNames[routeSeed]}路线` : '共通线'}</span>
      </div>
      <div className="meter-grid">
        <span>勇气</span>
        <meter min="0" max="6" value={stats.courage} />
        <span>灵感</span>
        <meter min="0" max="6" value={stats.inspiration} />
        <span>信赖</span>
        <meter min="0" max="6" value={stats.trust} />
        <span>遥</span>
        <meter min="0" max="6" value={affection.haruka} />
        <span>澪</span>
        <meter min="0" max="6" value={affection.mio} />
        <span>凛花</span>
        <meter min="0" max="6" value={affection.rinka} />
      </div>
    </aside>
  )
}

function LogPanel() {
  const logs = useGameStore((state) => state.logs)

  return (
    <aside className="log-panel love-log">
      <div className="panel-heading">
        <strong>记录</strong>
        <span>最近选择</span>
      </div>
      <ol>
        {logs.map((log) => (
          <li key={log.id}>{log.text}</li>
        ))}
      </ol>
    </aside>
  )
}

function StageHud() {
  const sceneId = useGameStore((state) => state.sceneId)
  const message = useGameStore((state) => state.message)
  const muted = useGameStore((state) => state.muted)
  const toggleMuted = useGameStore((state) => state.toggleMuted)
  const resetGame = useGameStore((state) => state.resetGame)
  const scene = getCurrentScene(sceneId)

  return (
    <div className="stage-hud love-hud">
      <div className="scene-title">
        <strong>{scene.name}</strong>
        <span>{scene.time} / {scene.bgmName}</span>
      </div>
      <div className="stage-controls">
        <button type="button" onClick={toggleMuted}>
          {muted ? '启声' : '静音'}
        </button>
        <button type="button" onClick={resetGame}>
          回标题
        </button>
      </div>
      <div className="stage-stat">
        <StatPanel />
      </div>
      <div className="stage-log">
        <LogPanel />
      </div>
      <div className="scene-message" data-testid="status-message">
        {message || scene.goal}
      </div>
    </div>
  )
}

function SceneView() {
  const sceneId = useGameStore((state) => state.sceneId)
  const scene = getCurrentScene(sceneId)

  return (
    <main className={clsx('game-shell love-shell', `scene-${sceneId}`)}>
      <section className="scene-panel" aria-label={scene.name}>
        <img className="scene-backdrop" src={scene.background} alt="" />
        <div className="scene-atmosphere" />
        <CharacterLayer />
        <StageHud />
        <ChoicePanel />
      </section>
      <DialogueBox />
      <VideoEventLayer />
    </main>
  )
}

function VideoEventLayer() {
  const videoEvent = useGameStore((state) => state.videoEvent)
  const closeVideoEvent = useGameStore((state) => state.closeVideoEvent)
  const muted = useGameStore((state) => state.muted)

  if (!videoEvent) {
    return null
  }

  return (
    <div className="video-event-backdrop" role="dialog" aria-modal="true">
      <section className="video-event" data-testid="video-event">
        <div className="video-event-copy">
          <span>{videoEvent.title}</span>
          <p>{videoEvent.text}</p>
        </div>
        <video
          key={videoEvent.id}
          src={videoEvent.src}
          poster={videoEvent.poster}
          autoPlay
          controls
          muted={muted}
          playsInline
          onEnded={closeVideoEvent}
          data-testid="video-event-player"
        />
        <button type="button" onClick={closeVideoEvent} data-testid="close-video-event">
          继续
        </button>
      </section>
    </div>
  )
}

function ChapterEnd() {
  const dialogue = useGameStore((state) => state.dialogue)
  const dialogueIndex = useGameStore((state) => state.dialogueIndex)
  const routeSeed = useGameStore((state) => state.routeSeed)
  const resetGame = useGameStore((state) => state.resetGame)
  const hasFinishedDialogue = dialogueIndex >= dialogue.length
  const routeName = routeSeed ? heroineNames[routeSeed] : '共通'

  return (
    <main className="ending-screen love-ending">
      <img className="ending-backdrop" src="/assets/backgrounds/empty-classroom-night.png" alt="" />
      <section>
        <p className="eyebrow">章节完成</p>
        <h1>第一章：雨后的空教室 完</h1>
        <p>第二章开局路线：{routeName}。第七封信将在明天寄出。</p>
        {hasFinishedDialogue && (
          <button type="button" onClick={resetGame} data-testid="restart">
            回到标题
          </button>
        )}
      </section>
      <DialogueBox />
    </main>
  )
}

function App() {
  const phase = useGameStore((state) => state.phase)
  const sceneId = useGameStore((state) => state.sceneId)
  const currentScene = useMemo(() => getCurrentScene(sceneId), [sceneId])
  useMusic()

  if (phase === 'title') {
    return (
      <>
        <AssetPreloader />
        <TitleScreen />
      </>
    )
  }

  if (phase === 'ending') {
    return <ChapterEnd />
  }

  return (
    <>
      <AssetPreloader />
      <SceneView key={currentScene.id} />
    </>
  )
}

export default App
