import { beforeEach, describe, expect, it } from 'vitest'
import { assetPath } from '../assets'
import { scenes } from '../content'
import { useGameStore } from '../store'

function advanceAllDialogue() {
  const guard = 20
  for (let index = 0; index < guard; index += 1) {
    const state = useGameStore.getState()
    if (!state.dialogue[state.dialogueIndex]) {
      return
    }
    state.advanceDialogue()
  }
}

describe('galgame store', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().resetGame()
  })

  it('runs the first chapter into a heroine route seed', () => {
    useGameStore.getState().startGame()
    expect(useGameStore.getState().sceneId).toBe('schoolGate')
    expect(useGameStore.getState().dialogue[0]?.audio).toBe(assetPath('/assets/voice/sg-01.mp3'))

    advanceAllDialogue()
    expect(useGameStore.getState().videoEvent?.src).toBe(
      assetPath('/assets/video/letter-first-rain.mp4'),
    )
    useGameStore.getState().closeVideoEvent()

    useGameStore.getState().selectChoice(scenes.schoolGate.choices[0])
    expect(useGameStore.getState().sceneId).toBe('classroom')
    expect(useGameStore.getState().affection.haruka).toBe(2)

    advanceAllDialogue()
    useGameStore.getState().selectChoice(scenes.classroom.choices[0])
    expect(useGameStore.getState().sceneId).toBe('musicRoom')
    expect(useGameStore.getState().affection.mio).toBe(2)

    advanceAllDialogue()
    expect(useGameStore.getState().videoEvent?.src).toBe(
      assetPath('/assets/video/mio-first-song.mp4'),
    )

    useGameStore.getState().closeVideoEvent()
    useGameStore.getState().selectChoice(scenes.musicRoom.choices[0])
    expect(useGameStore.getState().sceneId).toBe('nightClassroom')

    advanceAllDialogue()
    expect(useGameStore.getState().videoEvent?.src).toBe(
      assetPath('/assets/video/seventh-letter-classroom.mp4'),
    )
    useGameStore.getState().closeVideoEvent()

    useGameStore.getState().selectChoice(scenes.nightClassroom.choices[1])

    expect(useGameStore.getState().phase).toBe('ending')
    expect(useGameStore.getState().routeSeed).toBe('mio')
    expect(useGameStore.getState().affection.mio).toBe(6)
  })

  it('records stat deltas without dropping below zero', () => {
    useGameStore.getState().startGame()
    advanceAllDialogue()
    useGameStore.getState().selectChoice(scenes.schoolGate.choices[1])

    expect(useGameStore.getState().stats.inspiration).toBe(1)
    expect(useGameStore.getState().affection.rinka).toBe(1)
    expect(useGameStore.getState().logs[0]?.text).toContain('选择')
  })
})
