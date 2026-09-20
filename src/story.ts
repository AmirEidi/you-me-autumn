import rawStory from './story.json'

export const BACKGROUNDS = [
  'autumn',
  'coffee',
  'spring',
  'game',
  'cinematic',
  'night',
  'cozy',
] as const

export const KINDS = [
  'intro',
  'quest',
  'media',
  'co-op',
  'movie',
  'music',
  'choice',
] as const

export type Background = (typeof BACKGROUNDS)[number]
export type Kind = (typeof KINDS)[number]

export type StoryScene = {
  id: string
  background: Background
  eyebrow?: string
  lines: string[]
  cta: string
  kind?: Kind
  media?: {
    type: 'video' | 'image'
    src: string
    alt: string
    caption?: string
    fallback?: string
  }
  music?: {
    title: string
    src: string
    /**
     * Karaoke lines. `t` is the second the line lands on, or null when it has
     * not been synced yet — the player then spreads untimed lines evenly across
     * the track so the scene still works before anyone runs the sync tool.
     */
    lyrics?: LyricLine[]
  }
}

export type LyricLine = {
  t: number | null
  text: string
}

/**
 * story.json stores media paths relative to the public/ folder ("media/cat.mp4").
 * The deployed site lives under a sub-path, so every path has to be resolved
 * against the Vite base at runtime rather than baked in as an absolute "/media/...".
 */
export const asset = (path: string) => encodeURI(`${import.meta.env.BASE_URL}${path}`)

export const resolveScene = (scene: StoryScene): StoryScene => ({
  ...scene,
  media: scene.media ? { ...scene.media, src: asset(scene.media.src) } : undefined,
  music: scene.music ? { ...scene.music, src: asset(scene.music.src) } : undefined,
})

export const story: StoryScene[] = (rawStory as StoryScene[]).map(resolveScene)

export const emptyScene = (): StoryScene => ({
  id: `scene-${Math.random().toString(36).slice(2, 7)}`,
  background: 'autumn',
  eyebrow: '',
  lines: ['...'],
  cta: 'ادامه',
})

export const toFaNumber = (value: number) =>
  String(value).replace(/[0-9]/g, (digit) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][Number(digit)])
