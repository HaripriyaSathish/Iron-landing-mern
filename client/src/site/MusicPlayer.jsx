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

// Round music button in the bottom-left corner. Browsers only allow sound after the visitor
// interacts, so with autostart the track begins on their first tap, click or key press.
export default function MusicPlayer({ music, labels = {} }) {
  const audioRef = useRef(null)
  const buttonRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (audioRef.current && music) audioRef.current.volume = music.volume / 100
  }, [music])

  // First interaction anywhere starts the music (a tap on the button itself is handled by the button)
  useEffect(() => {
    if (!music?.autostart || readPaused()) return
    const start = (e) => {
      if (buttonRef.current?.contains(e.target)) return
      audioRef.current?.play().catch(() => {})
      remove()
    }
    const remove = () => {
      document.removeEventListener('pointerdown', start)
      document.removeEventListener('keydown', start)
    }
    document.addEventListener('pointerdown', start)
    document.addEventListener('keydown', start)
    return remove
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
    <div className={`music ${playing ? 'is-playing' : ''}`}>
      <audio
        ref={audioRef}
        src={music.url}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
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
