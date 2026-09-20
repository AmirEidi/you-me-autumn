import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { story as defaultStory, toFaNumber, type LyricLine, type StoryScene } from './story'

function MediaFrame({ media }: { media: StoryScene['media'] }) {
  const [failed, setFailed] = useState(false)

  if (!media) return null

  if (failed || !media.src) {
    return (
      <div className="media-fallback">
        <span aria-hidden="true">🎞️</span>
        <p>{media.fallback ?? 'یه چیزی اینجا باید دیده می‌شد...'}</p>
      </div>
    )
  }

  return (
    <div className="media-card">
      {media.type === 'video' ? (
        <video src={media.src} muted autoPlay loop playsInline onError={() => setFailed(true)} />
      ) : (
        <img src={media.src} alt={media.alt} onError={() => setFailed(true)} />
      )}
      {media.caption && <p className="media-caption">{media.caption}</p>}
    </div>
  )
}

type AppProps = {
  /** Editor preview passes its unsaved draft here; the site itself uses story.json. */
  scenes?: StoryScene[]
  /** Editor preview pins the view to one scene instead of letting the reader advance. */
  previewIndex?: number
}

/**
 * Resolve a play time for every lyric line.
 *
 * Lines carry a `t` only once someone has run the editor's sync tool. Until
 * then they are spread evenly across the track, so the scene is watchable
 * immediately instead of dumping all the lyrics at once. A partly-synced list
 * holds the last known time forward rather than snapping back to zero.
 */
const resolveTimings = (lyrics: LyricLine[], duration: number): number[] => {
  if (lyrics.length === 0) return []

  if (lyrics.some((line) => typeof line.t === 'number')) {
    let last = 0
    return lyrics.map((line) => {
      if (typeof line.t === 'number') last = line.t
      return last
    })
  }

  if (!duration) return lyrics.map(() => 0)
  const step = duration / (lyrics.length + 1)
  return lyrics.map((_, index) => step * (index + 1))
}

function MusicPlayer({ music }: { music: NonNullable<StoryScene['music']> }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeRef = useRef<HTMLParagraphElement | null>(null)
  const [failed, setFailed] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const lyrics = useMemo(() => music.lyrics ?? [], [music.lyrics])
  const timings = useMemo(() => resolveTimings(lyrics, duration), [lyrics, duration])

  const activeIndex = useMemo(() => {
    let found = -1
    for (let i = 0; i < timings.length; i += 1) {
      if (timings[i] <= time) found = i
      else break
    }
    return found
  }, [timings, time])

  // The reader has clicked through a dozen scenes to get here, so the page
  // already has user activation and autoplay is normally allowed. Browsers can
  // still refuse, so fall back to a play button rather than a silent scene.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.play().then(
      () => setBlocked(false),
      () => setBlocked(true),
    )
  }, [music.src])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeIndex])

  const play = () => {
    audioRef.current?.play().then(
      () => setBlocked(false),
      () => setBlocked(true),
    )
  }

  if (failed) {
    return (
      <div className="music-card">
        <div className="music-header">
          <span aria-hidden="true">♫</span>
          <strong>{music.title}</strong>
        </div>
        <div className="music-fallback">
          <p>🎧</p>
          <p>{music.title}</p>
          <small>فایل آهنگ هنوز نرسیده :)</small>
        </div>
      </div>
    )
  }

  return (
    <div className="music-card">
      <div className="music-header">
        <span aria-hidden="true">♫</span>
        <strong>{music.title}</strong>
      </div>

      <audio
        ref={audioRef}
        src={music.src}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => setFailed(true)}
      />

      {blocked && (
        <button className="audio-button" onClick={play} type="button">
          ▶ پخش
        </button>
      )}

      {lyrics.length > 0 && (
        <div className="lyrics" dir="ltr">
          {lyrics.map((line, index) => (
            <p
              key={index}
              ref={index === activeIndex ? activeRef : null}
              className={index === activeIndex ? 'lyric-line active' : 'lyric-line'}
            >
              {line.text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function App({ scenes, previewIndex }: AppProps = {}) {
  const story = scenes && scenes.length > 0 ? scenes : defaultStory
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState<'yes' | 'later' | null>(null)
  const [fleePosition, setFleePosition] = useState({ x: 120, y: 30 })
  const choiceRef = useRef<HTMLDivElement | null>(null)

  const activeIndex = Math.min(previewIndex ?? currentIndex, story.length - 1)
  const scene = story[activeIndex]
  const progress = ((activeIndex + 1) / story.length) * 100

  // Jumping to another scene in the editor should start that scene from a clean slate.
  useEffect(() => {
    if (previewIndex === undefined) return
    setAnswer(null)
  }, [previewIndex])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (scene.kind === 'choice' || answer) return
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault()
        setCurrentIndex((index) => Math.min(index + 1, story.length - 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [answer, scene.kind, story.length])

  const moveFleeButton = () => {
    const box = choiceRef.current
    if (!box) return

    const width = box.clientWidth
    const height = box.clientHeight
    const safeWidth = Math.max(150, Math.min(width * 0.42, 200))
    const safeHeight = Math.max(50, Math.min(height * 0.5, 80))
    const centerX = width / 2
    const centerY = height / 2

    const minX = Math.max(12, centerX - 110)
    const maxX = Math.min(width - safeWidth - 12, centerX + 110)
    const minY = Math.max(12, centerY - 26)
    const maxY = Math.min(height - safeHeight - 12, centerY + 26)

    const newX = minX + Math.random() * Math.max(1, maxX - minX)
    const newY = minY + Math.random() * Math.max(1, maxY - minY)
    setFleePosition({ x: newX, y: newY })
  }

  const nextScene = () => {
    if (scene.kind === 'choice') return
    setCurrentIndex((index) => Math.min(index + 1, story.length - 1))
  }

  const handleChoice = (value: 'yes' | 'later') => {
    setAnswer(value)
  }

  const restart = () => {
    setCurrentIndex(0)
    setAnswer(null)
    setFleePosition({ x: 0, y: 0 })
  }

  return (
    <div className="app-shell">
      <div className={`scene-shell ${scene.background}`}>
        <div className="vignette" />

        <header className="scene-header">
          <div className="badge">{scene.eyebrow}</div>
          <div className="progress-wrap" aria-label="پیشرفت داستان">
            <span>{toFaNumber(activeIndex + 1)} / {toFaNumber(story.length)}</span>
            <div className="progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <main className="story-panel" aria-live="polite">
          {scene.kind === 'intro' && (
            <div className="profile-card">
              <div className="profile-header">مشخصات بازیکن</div>
              <div className="profile-row">
                <span className="label">نام</span>
                <strong>امیرعباس</strong>
              </div>
              <div className="profile-row">
                <span className="label">طبقه</span>
                <strong>برنامه‌نویس بازی 🎮</strong>
              </div>
              <div className="profile-row">
                <span className="label">توانایی خاص</span>
                <strong>هک کردن دل‌ها با کد</strong>
              </div>
            </div>
          )}

          {scene.media && <MediaFrame media={scene.media} />}

          <div className="text-block">
            {scene.lines.map((line, index) => (
              <p
                key={`${scene.id}-${index}`}
                className="story-line"
                style={{ animationDelay: `${index * 0.18}s` }}
              >
                {line}
              </p>
            ))}
          </div>

          {scene.kind === 'music' && scene.music && <MusicPlayer music={scene.music} />}

          {scene.kind === 'choice' && answer === null && (
            <div className="choice-box" ref={choiceRef}>
              <button className="yes-btn" onClick={() => handleChoice('yes')} type="button">
                آره 🥹
              </button>

              <button
                className="later-btn"
                type="button"
                style={{ left: `${fleePosition.x}px`, top: `${fleePosition.y}px` }}
                onMouseEnter={moveFleeButton}
                onMouseMove={moveFleeButton}
                onFocus={moveFleeButton}
                onTouchStart={moveFleeButton}
                onClick={() => handleChoice('later')}
              >
                بذار فکر کنم 👀
              </button>
            </div>
          )}

          {scene.kind === 'choice' && answer === 'later' && (
            <div className="choice-box confirm-box" ref={choiceRef}>
              <div className="confirm-title">مطمئنی؟</div>
              <button
                className="yes-btn single-yes"
                type="button"
                onClick={() => handleChoice('yes')}
              >
                نه بابا شوخی کردم، معلومه که آره میام 😄
              </button>
            </div>
          )}

          {scene.kind === 'choice' && answer === 'yes' && (
            <div className="result-box">
              <h3>پس قرارمون قطعی شد ☕🍂</h3>
              <button className="restart-btn" onClick={restart} type="button">
                از اول ببینیم؟
              </button>
            </div>
          )}
        </main>

        <footer className="scene-footer">
          {scene.kind !== 'choice' && answer === null && (
            <button className="continue-btn" onClick={nextScene} type="button">
              {scene.cta}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default App
