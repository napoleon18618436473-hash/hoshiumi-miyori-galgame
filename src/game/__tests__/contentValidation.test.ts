import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assetPath } from '../assets'
import { characters, endingDialogue, scenes, themeSong } from '../content'
import { validateDialogueAudio, validateSceneGraph } from '../contentValidation'

function toPublicPath(url: string) {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const pathname = new URL(url, 'https://example.test').pathname
  const withoutBase = pathname.startsWith(baseUrl)
    ? pathname.slice(baseUrl.length)
    : pathname.replace(/^\//, '')

  return join(process.cwd(), 'public', withoutBase)
}

function collectReferencedAssets() {
  return [
    themeSong,
    assetPath('/assets/ui/hoshiumi-title.png'),
    assetPath('/assets/backgrounds/empty-classroom-night.png'),
    ...characters.flatMap((character) => character.portrait || []),
    ...Object.values(scenes).flatMap((scene) => [
      scene.background,
      scene.bgm,
      ...scene.dialogue.map((line) => line.audio),
      ...(scene.videoEventAfterDialogue
        ? [scene.videoEventAfterDialogue.src, scene.videoEventAfterDialogue.poster]
        : []),
    ]),
    ...endingDialogue.map((line) => line.audio),
  ]
}

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

  it('keeps all referenced public media files present', () => {
    const missingAssets = collectReferencedAssets()
      .filter((asset) => !existsSync(toPublicPath(asset)))

    expect(missingAssets).toEqual([])
  })
})
