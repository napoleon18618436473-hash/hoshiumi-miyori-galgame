import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { endingDialogue, initialAffection, initialStats, scenes } from './content'
import type {
  AffectionBlock,
  Choice,
  DialogueLine,
  GameLog,
  HeroineId,
  Phase,
  SceneId,
  StatBlock,
  VideoEvent,
} from './types'

type GameStore = {
  phase: Phase
  sceneId: SceneId
  dialogue: DialogueLine[]
  dialogueIndex: number
  stats: StatBlock
  affection: AffectionBlock
  flags: Record<string, boolean>
  routeSeed?: HeroineId
  logs: GameLog[]
  message: string
  videoEvent?: VideoEvent
  muted: boolean
  startGame: () => void
  advanceDialogue: () => void
  selectChoice: (choice: Choice) => void
  closeVideoEvent: () => void
  toggleMuted: () => void
  resetGame: () => void
}

const firstSceneId: SceneId = 'schoolGate'

const startingState = {
  phase: 'title' as Phase,
  sceneId: firstSceneId,
  dialogue: [] as DialogueLine[],
  dialogueIndex: 0,
  stats: initialStats,
  affection: initialAffection,
  flags: {},
  routeSeed: undefined,
  logs: [] as GameLog[],
  message: '点开第一封信。',
  videoEvent: undefined,
  muted: false,
}

function addLog(logs: GameLog[], text: string) {
  return [{ id: `${Date.now()}-${logs.length}`, text }, ...logs].slice(0, 8)
}

function applyStats(current: StatBlock, delta?: Partial<StatBlock>) {
  if (!delta) {
    return current
  }

  return {
    courage: Math.max(0, current.courage + (delta.courage || 0)),
    inspiration: Math.max(0, current.inspiration + (delta.inspiration || 0)),
    trust: Math.max(0, current.trust + (delta.trust || 0)),
  }
}

function applyAffection(current: AffectionBlock, delta?: Partial<AffectionBlock>) {
  if (!delta) {
    return current
  }

  return {
    haruka: Math.max(0, current.haruka + (delta.haruka || 0)),
    mio: Math.max(0, current.mio + (delta.mio || 0)),
    rinka: Math.max(0, current.rinka + (delta.rinka || 0)),
  }
}

function formatDelta(choice: Choice) {
  const chunks: string[] = []

  if (choice.statDelta) {
    Object.entries(choice.statDelta).forEach(([key, value]) => {
      if (value) {
        chunks.push(`${key}+${value}`)
      }
    })
  }

  if (choice.affectionDelta) {
    Object.entries(choice.affectionDelta).forEach(([key, value]) => {
      if (value) {
        chunks.push(`${key}${value > 0 ? '+' : ''}${value}`)
      }
    })
  }

  return chunks.length ? `选择：${choice.text}（${chunks.join(' / ')}）` : `选择：${choice.text}`
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...startingState,
        startGame: () => {
          const scene = scenes[firstSceneId]
          set({
            phase: 'playing',
            sceneId: firstSceneId,
            dialogue: scene.dialogue,
            dialogueIndex: 0,
            stats: { ...initialStats },
            affection: { ...initialAffection },
            flags: {},
            routeSeed: undefined,
            logs: [{ id: 'start', text: '第一封信出现在鞋柜里。' }],
            message: scene.goal,
            videoEvent: undefined,
          })
        },
        advanceDialogue: () => {
          const state = get()
          const nextIndex = state.dialogueIndex + 1

          if (nextIndex < state.dialogue.length) {
            set({ dialogueIndex: nextIndex })
            return
          }

          if (state.phase === 'ending') {
            set({ dialogueIndex: state.dialogue.length })
            return
          }

          const scene = scenes[state.sceneId]
          const videoEventFlag = `${state.sceneId}VideoSeen`

          if (scene.videoEventAfterDialogue && !state.flags[videoEventFlag]) {
            set({
              dialogueIndex: state.dialogue.length,
              flags: { ...state.flags, [videoEventFlag]: true },
              message: scene.videoEventAfterDialogue.messageAfter,
              videoEvent: scene.videoEventAfterDialogue,
            })
            return
          }

          set({
            dialogueIndex: state.dialogue.length,
            message: '选择会改变好感、能力值和第二章开局。',
          })
        },
        selectChoice: (choice) => {
          const state = get()
          const nextStats = applyStats(state.stats, choice.statDelta)
          const nextAffection = applyAffection(state.affection, choice.affectionDelta)
          const nextFlags = choice.flag
            ? { ...state.flags, [choice.flag]: true }
            : { ...state.flags }
          const nextLogs = addLog(state.logs, formatDelta(choice))

          if (choice.ending) {
            set({
              phase: 'ending',
              dialogue: endingDialogue,
              dialogueIndex: 0,
              stats: nextStats,
              affection: nextAffection,
              flags: nextFlags,
              routeSeed: choice.routeSeed || state.routeSeed,
              logs: nextLogs,
              message: '第一章完成。第二章路线已记录。',
            })
            return
          }

          const nextSceneId = choice.nextScene || state.sceneId
          const nextScene = scenes[nextSceneId]

          set({
            sceneId: nextSceneId,
            dialogue: nextScene.dialogue,
            dialogueIndex: 0,
            stats: nextStats,
            affection: nextAffection,
            flags: nextFlags,
            routeSeed: choice.routeSeed || state.routeSeed,
            logs: nextLogs,
            message: choice.videoEvent?.messageAfter || nextScene.goal,
            videoEvent: choice.videoEvent,
          })
        },
        closeVideoEvent: () => {
          const state = get()
          set({
            videoEvent: undefined,
            message: state.videoEvent?.messageAfter || state.message,
          })
        },
        toggleMuted: () => {
          set((state) => ({ muted: !state.muted }))
        },
        resetGame: () => {
          set({ ...startingState, logs: [] })
        },
      }),
      {
        name: 'hoshiumi-save',
        partialize: (state) => ({
          phase: state.phase,
          sceneId: state.sceneId,
          dialogue: state.dialogue,
          dialogueIndex: state.dialogueIndex,
          stats: state.stats,
          affection: state.affection,
          flags: state.flags,
          routeSeed: state.routeSeed,
          logs: state.logs,
          message: state.message,
          muted: state.muted,
        }),
      },
    ),
  ),
)

export function getCurrentScene(sceneId: SceneId) {
  return scenes[sceneId]
}
