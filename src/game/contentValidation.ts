import { characters, endingDialogue, scenes } from './content'

const characterIds = new Set(characters.map((character) => character.id))

export function collectMissingAssetPaths(paths: string[], exists: (path: string) => boolean) {
  return paths.filter((path) => !exists(path))
}

export function validateDialogueAudio() {
  const lines = [
    ...Object.values(scenes).flatMap((scene) => scene.dialogue),
    ...endingDialogue,
  ]

  return lines
    .filter((line) => !line.audio)
    .map((line) => `${line.id}:${line.speaker}`)
}

export function validateSceneGraph() {
  const sceneIds = new Set(Object.keys(scenes))
  const errors: string[] = []

  Object.values(scenes).forEach((scene) => {
    scene.cast.forEach((characterId) => {
      if (!characterIds.has(characterId)) {
        errors.push(`${scene.id} references unknown character ${characterId}`)
      }
    })

    scene.dialogue.forEach((line) => {
      if (line.characterId && !characterIds.has(line.characterId)) {
        errors.push(`${line.id} references unknown character ${line.characterId}`)
      }
    })

    scene.choices.forEach((choice) => {
      if (choice.nextScene && !sceneIds.has(choice.nextScene)) {
        errors.push(`${choice.id} points to missing scene ${choice.nextScene}`)
      }
    })
  })

  return errors
}
