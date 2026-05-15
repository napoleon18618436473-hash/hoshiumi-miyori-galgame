export type Phase = 'title' | 'playing' | 'ending'

export type SceneId = 'schoolGate' | 'classroom' | 'musicRoom' | 'nightClassroom'

export type CharacterId = 'narrator' | 'yuto' | 'haruka' | 'mio' | 'rinka'

export type HeroineId = 'haruka' | 'mio' | 'rinka'

export type StatKey = 'courage' | 'inspiration' | 'trust'

export type CharacterPosition = 'left' | 'center' | 'right'

export type DialogueLine = {
  id: string
  speaker: string
  text: string
  audio: string
  characterId?: CharacterId
  mood?: string
  position?: CharacterPosition
}

export type Character = {
  id: CharacterId
  name: string
  role: string
  portrait?: string
  description: string
}

export type StatBlock = Record<StatKey, number>

export type AffectionBlock = Record<HeroineId, number>

export type VideoEvent = {
  id: string
  title: string
  text: string
  src: string
  poster: string
  messageAfter: string
}

export type Choice = {
  id: string
  text: string
  description: string
  statDelta?: Partial<StatBlock>
  affectionDelta?: Partial<AffectionBlock>
  nextScene?: SceneId
  routeSeed?: HeroineId
  flag?: string
  videoEvent?: VideoEvent
  ending?: boolean
}

export type Scene = {
  id: SceneId
  name: string
  time: string
  subtitle: string
  background: string
  bgm: string
  bgmName: string
  goal: string
  cast: CharacterId[]
  dialogue: DialogueLine[]
  videoEventAfterDialogue?: VideoEvent
  choices: Choice[]
}

export type GameLog = {
  id: string
  text: string
}
