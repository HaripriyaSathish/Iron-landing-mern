import { useEffect, useRef, useState } from 'react'
import { Music, Pause } from 'lucide-react'

// Remembers a visitor who paused the music, so it stays quiet on their next visit
const PAUSED_KEY = 'imk_music_paused'

const readPaused = () => {
  try {
    return localStorage.getItem(PAUSED_KEY) === '1'
  } catch {
    return false
  }
}

const writePaused = (paused) => {
  try {
    if (paused) localStorage.setItem(PAUSED_KEY, '1')
    else localStorage.removeItem(PAUSED_KEY)
  } catch {
    // Private mode: the choice just isn't remembered
  }
}

// Events that count as the visitor interacting, which lets the browser play sound
const UNLOCK_EVENTS = ['pointerdown', 'click', 'touchend', 'keydown']

// Round music button in the bottom-left corner. With autostart the track tries to play as soon as the
// page opens. Most browsers block sound until the visitor interacts, so if that is refused it starts on
// their first tap, click or key press instead, and the button pulses meanwhile.
export default function MusicPlayer({ music, labels = {} }) {
  const audioRef = useRef(null)
  const buttonRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (audioRef.current && music) audioRef.current.volume = music.volume / 100
  }, [music])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !music?.autostart || readPaused()) return
    let done = false

    const stopListening = () => UNLOCK_EVENTS.forEach((type) => document.removeEventListener(type, start, true))
    // A tap on the music button itself is handled by the button
    function start(e) {
      if (done || buttonRef.current?.contains(e.target)) return
      // Already started from the button, or paused there on purpose: leave it to the visitor
      if (!audio.paused || readPaused()) {
        done = true
        stopListening()
        return
      }
      audio
        .play()
        .then(() => {
          done = true
          stopListening()
        })
        .catch(() => {}) // still blocked: the next interaction tries again
    }

    audio
      .play()
      .then(() => {
        done = true
      })
      .catch(() => {
        if (done) return
        setWaiting(true)
        UNLOCK_EVENTS.forEach((type) => document.addEventListener(type, start, true))
      })

    return () => {
      done = true
      stopListening()
    }
  }, [music])

  // Quiet while the visitor is on another tab, back on when they return
  useEffect(() => {
    let resume = false
    const onVisibility = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) {
        resume = !audio.paused
        audio.pause()
      } else if (resume) {
        audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (!music) return null

  const toggle = () => {
    const audio = audioRef.current
    if (audio.paused) {
      writePaused(false)
      audio.play().catch(() => {})
    } else {
      writePaused(true)
      audio.pause()
    }
  }

  const label = playing ? labels.music_pause || 'Pause music' : labels.music_play || 'Play music'

  return (
    <div className={`music ${playing ? 'is-playing' : waiting ? 'is-waiting' : ''}`}>
      <audio
        ref={audioRef}
        src={music.url}
        loop
        preload={music.autostart ? 'auto' : 'none'}
        onPlay={() => {
          setPlaying(true)
          setWaiting(false)
        }}
        onPause={() => setPlaying(false)}
      />
      <button
        ref={buttonRef}
        type="button"
        className="music__btn"
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing}
        title={music.title ? `${label} · ${music.title}` : label}
      >
        {playing ? <Pause size={20} /> : <Music size={20} />}
        <span className="music__bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  )
}
