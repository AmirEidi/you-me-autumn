import { useEffect, useRef, useState } from 'react'
import './App.css'

type StoryScene = {
  id: string
  background: 'autumn' | 'coffee' | 'spring' | 'game' | 'cinematic' | 'night' | 'cozy'
  eyebrow?: string
  lines: string[]
  cta: string
  kind?: 'intro' | 'quest' | 'media' | 'co-op' | 'movie' | 'music' | 'choice'
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
  }
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const toFaNumber = (value: number) =>
  String(value).replace(/[0-9]/g, (digit) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][Number(digit)])

const story: StoryScene[] = [
  {
    id: 'greeting',
    background: 'autumn',
    eyebrow: 'صحنه ۱',
    lines: [
      'سلام خانوم دارچینی 🦦',
      'خوشحالم که دعوت منو برای تور شگفت‌عقلاده «چرا باید منو واست دیت انتخاب کنی» پذیرفتی',
    ],
    cta: 'خب، بریم؟ 👀',
  },
  {
    id: 'intro',
    background: 'game',
    eyebrow: 'صحنه ۲',
    kind: 'intro',
    lines: [
      'خب اجازه بدین که خودمو معرفی کنم ☝️',
      'باس هستم، عباس 😎',
      'من یه برنامه‌نویسم، با اجازه مهندسم یه پارچه آقا',
      'اشتباه نکن، هک بلدن نیستم',
      '(البته که قلبت هک می‌کنم)',
      'من بازیسازم',
      'خلاقیت، تجربه، یکسری حسایی که نمیشه تو دنیای واقعی تجربه کرد رو من توی بازی پیدا می‌کنم.',
    ],
    cta: 'ادامه بده',
  },
  {
    id: 'coffee',
    background: 'coffee',
    eyebrow: 'صحنه ۴',
    lines: [
      'چون قراره که اولین قهوه پاییزمون رو باهم بخوریم تو یه کافه دنج',
      'و بعدش بریم خیابون ولیعصر رو قدم بزنیم',
      'زمان از دستمون بره ☕🍂',
    ],
    cta: 'ادامه',
  },
  {
    id: 'spring',
    background: 'spring',
    eyebrow: 'صحنه ۵',
    lines: [
      'چون من فقط ۲۶ تا فصل بهار توی زندگیم دیدم',
      'و میخوام بشینم داستان اون سه تا فصل بهاری که ندیدم رو از تو بشنوم 🌱',
    ],
    cta: 'ادامه',
  },
  {
    id: 'cat',
    background: 'cozy',
    eyebrow: 'صحنه ۶',
    kind: 'media',
    media: {
      type: 'video',
      src: asset('media/cat.mp4'),
      alt: 'گربه‌ای که مثل توست',
      caption: '🐈',
      fallback: 'یه گربه‌ی خیلی جذاب اینجا باید دیده می‌شد...',
    },
    lines: ['چون تو شبیه این گربه‌هه ای', 'و من میخوام بدزدمت 🐈'],
    cta: 'ادامه',
  },
  {
    id: 'money',
    background: 'night',
    eyebrow: 'صحنه ۷',
    lines: [
      'چون خیلی پولیثی',
      'این داستانشو باید برات تعریف کنم، خیلی باحاله',
    ],
    cta: 'ادامه',
  },
  {
    id: 'stutter',
    background: 'game',
    eyebrow: 'صحنه ۸',
    lines: [
      'چون به قول آقا مهدی ضامنی (سکران)',
      'ل-ل-لکنت دارم، م-م-من...',
    ],
    cta: 'ادامه',
  },
  {
    id: 'still-no',
    background: 'night',
    eyebrow: 'صحنه ۹',
    lines: [
      'هنوووز قانع نشدی؟ 😭',
      'خب اشکال نداره، بیا هنوز ادامه داره',
    ],
    cta: 'ادامه',
  },
  {
    id: 'convince-me',
    background: 'night',
    eyebrow: 'صحنه ۱۰',
    lines: ['خب ببین، سعی کن قانع شی'],
    cta: 'ادامه',
  },
  {
    id: 'still-no-2',
    background: 'night',
    eyebrow: 'صحنه ۱۲',
    lines: [
      'هنوووز هم نه؟ 😭',
      'پس بزار یه چیزی رو بهت بگم...',
    ],
    cta: 'ادامه',
  },
  {
    id: 'movie',
    background: 'cinematic',
    eyebrow: 'صحنه ۱۳',
    kind: 'movie',
    media: {
      type: 'video',
      src: asset('media/movie.mp4'),
      alt: '🎬',
      caption: '🎬',
      fallback: 'یه صحنه‌ی سینمایی اینجا باید دیده می‌شد...',
    },
    lines: [
      'به نظر من زندگی مثل یه فیلم سینمایی میمونه...',
      'تنهایی دیدنش هیچ کیفی نداره،',
      'این فیلم رو باید دونفری دید.',
      'و من خیلی دوست دارم این فیلم رو با تو ببینم.',
    ],
    cta: 'ادامه',
  },
  {
    id: 'music',
    background: 'cozy',
    eyebrow: 'صحنه ۱۴',
    kind: 'music',
    music: {
      title: 'Cinnamon Girl',
      src: encodeURI(asset('media/Cinnamon Girl.mp3')),
    },
    lines: [
      'خب دیگه داریم کم کم به پایان تور نزدیک میشیم...',
      'ولی قبل بزارم واست یه آهنگ پخش کنم',
      'بهت قول میدم خوشت میاد 🎧',
    ],
    cta: 'ادامه',
  },
  {
    id: 'closing',
    background: 'autumn',
    eyebrow: 'صحنه ۱۵',
    lines: [
      'خب امیدوارم که از این تور خوشت اومده باشه',
      'من که خیلی کیف کردم وقتی داشتم اینارو برات مینوشتم',
      'این بخش کوچیکی از دلیل‌هایی بود که چرا فکر میکنم با من دیت بیای',
      'و خیلی مشتاقم که ببینم',
      'و چون دوست دارم کار رو رسمی نگه دارم باید بپرسم که.....',
    ],
    cta: 'برو به سوال نهایی',
  },
  {
    id: 'final',
    background: 'cinematic',
    eyebrow: 'سوال نهایی',
    kind: 'choice',
    lines: ['می‌خوای با من یه قرار بذاریم؟'],
    cta: 'آره 🥹',
  },
]

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

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState<'yes' | 'later' | null>(null)
  const [audioError, setAudioError] = useState(false)
  const [fleePosition, setFleePosition] = useState({ x: 120, y: 30 })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const choiceRef = useRef<HTMLDivElement | null>(null)

  const scene = story[currentIndex]
  const progress = ((currentIndex + 1) / story.length) * 100

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
  }, [answer, scene.kind])

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
    setAudioError(false)
    setFleePosition({ x: 0, y: 0 })
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const enableAudio = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      await audio.play()
    } catch {
      setAudioError(true)
    }
  }

  return (
    <div className="app-shell">
      <div className={`scene-shell ${scene.background}`}>
        <div className="vignette" />

        <header className="scene-header">
          <div className="badge">{scene.eyebrow}</div>
          <div className="progress-wrap" aria-label="پیشرفت داستان">
            <span>{toFaNumber(currentIndex + 1)} / {toFaNumber(story.length)}</span>
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

          {scene.kind === 'music' && (
            <div className="music-card">
              <div className="music-header">
                <span aria-hidden="true">♫</span>
                <strong>{scene.music?.title}</strong>
              </div>

              {audioError ? (
                <div className="music-fallback">
                  <p>🎧</p>
                  <p>Cinnamon Girl</p>
                  <small>فایل آهنگ هنوز نرسیده :)</small>
                </div>
              ) : (
                <>
                  <audio
                    ref={audioRef}
                    src={scene.music?.src}
                    onError={() => setAudioError(true)}
                  />
                  <button className="audio-button" onClick={enableAudio} type="button">
                    ▶ پخش
                  </button>
                </>
              )}
            </div>
          )}

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
