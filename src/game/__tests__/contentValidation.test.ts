import { describe, expect, it } from 'vitest'
import { endingDialogue, scenes } from '../content'
import { validateDialogueAudio, validateSceneGraph } from '../contentValidation'

describe('galgame content validation', () => {
  it('keeps every formal dialogue line bound to voice audio', () => {
    expect(validateDialogueAudio()).toEqual([])
  })

  it('keeps scene links and character references valid', () => {
    expect(validateSceneGraph()).toEqual([])
  })

  it('has different bgm for every scene and a complete first chapter ending', () => {
    const bgm = Object.values(scenes).map((scene) => scene.bgm)
    expect(new Set(bgm).size).toBe(bgm.length)
    expect(scenes.nightClassroom.choices.every((choice) => choice.ending)).toBe(true)
    expect(endingDialogue.every((line) => line.audio)).toBe(true)
  })
})
