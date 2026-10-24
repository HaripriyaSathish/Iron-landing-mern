import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Each slide stays this long; the photo zooms in over the same time
const SLIDE_MS = 6000

export default function Hero({ slides = [] }) {
  const [index, setIndex] = useState(0)
  // Bumped on manual navigation so the autoplay timer restarts from zero
  const [timerKey, setTimerKey] = useState(0)
  const count = slides.length
  const current = count ? index % count : 0

  const go = useCallback(
    (next) => {
      setIndex(((next % count) + count) % count)
      setTimerKey((k) => k + 1)
    },
    [count],
  )

  useEffect(() => {
    if (count < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS)
    return () => clearInterval(id)
  }, [count, timerKey])

  // Swipe left/right on phones (arrows are hidden there)
  const [touchX, setTouchX] = useState(null)
  const onTouchEnd = (e) => {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1))
    setTouchX(null)
  }

  if (!count) return <section id="home" className="hero hero--empty" />

  return (
    <section
      id="home"
      className="hero"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => {
        const isActive = i === current
        return (
          <div
            key={s.id}
            className={`hero__slide ${isActive ? 'is-active' : ''}`}
            aria-hidden={!isActive}
            style={{ '--slide-ms': `${SLIDE_MS}ms` }}
          >
            {s.image_url ? (
              // Zoom restarts by CSS each time the slide becomes active
              <img className="hero__img" src={s.image_url} alt={s.image_alt || ''} fetchPriority={i === 0 ? 'high' : 'auto'} />
            ) : (
              <div className="hero__img hero__img--fallback" />
            )}
            <div className="hero__shade" />
            <div className="container hero__content">
              {s.tagline && <span className="eyebrow">{s.tagline}</span>}
              <h1>{s.heading}</h1>
              {s.description && <p>{s.description}</p>}
              <div className="hero__actions">
                {s.primary_btn_text && (
                  <a href={s.primary_btn_link || '#contact'} className="site-btn site-btn--primary site-btn--lg" tabIndex={isActive ? 0 : -1}>
                    {s.primary_btn_text}
                  </a>
                )}
                {s.secondary_btn_text && (
                  <a
                    href={s.secondary_btn_link || '#services'}
                    className="site-btn site-btn--outline-gold site-btn--lg"
                    tabIndex={isActive ? 0 : -1}
                  >
                    {s.secondary_btn_text}
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {count > 1 && (
        <>
          <button type="button" className="hero__arrow hero__arrow--prev" onClick={() => go(current - 1)} aria-label="Previous slide">
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="hero__arrow hero__arrow--next" onClick={() => go(current + 1)} aria-label="Next slide">
            <ChevronRight size={22} />
          </button>
          <div className="hero__dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={i === current ? 'is-active' : ''}
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
