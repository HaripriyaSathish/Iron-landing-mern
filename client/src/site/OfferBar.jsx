import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'

// Gold sparkles twinkling across the strip: [left %, top %, delay s, size px]
const SPARKLES = [
  [6, 30, 0, 5],
  [18, 70, 1.4, 4],
  [33, 25, 0.7, 3],
  [52, 75, 2.1, 4],
  [68, 30, 1.1, 5],
  [81, 70, 0.3, 3],
  [93, 35, 1.8, 4],
]

const pad = (n) => String(n).padStart(2, '0')

// "2d 04:12:09" until the end time, or null once it has passed
function timeLeft(endsAt, now) {
  const ms = new Date(endsAt).getTime() - now
  if (!(ms > 0)) return null
  const s = Math.floor(ms / 1000)
  const days = Math.floor(s / 86400)
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
  return days ? `${days}d ${clock}` : clock
}

// Flash offer strip above the fixed header. Its height is shared as --offer-h so the header
// and the hero move down to make room for it.
export default function OfferBar({ offer }) {
  const ref = useRef(null)
  const [now, setNow] = useState(() => Date.now())

  const countdown = offer?.ends_at ? timeLeft(offer.ends_at, now) : null
  const ended = !!offer?.ends_at && !countdown
  const visible = !!offer && !ended

  useEffect(() => {
    if (!visible || !offer.ends_at) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [visible, offer?.ends_at])

  useLayoutEffect(() => {
    const el = ref.current
    const site = el?.closest('.site')
    if (!visible || !site) return
    const update = () => site.style.setProperty('--offer-h', `${el.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      observer.disconnect()
      site.style.removeProperty('--offer-h')
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`offer ${offer.message ? '' : 'offer--badge-only'}`} ref={ref} role="region" aria-label={offer.badge_text || 'Offer'}>
      {SPARKLES.map(([left, top, delay, size]) => (
        <span
          key={left}
          className="offer__spark"
          aria-hidden="true"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
        />
      ))}
      <div className="container offer__inner">
        {offer.badge_text && (
          <span className="offer__badge">
            <Zap size={13} fill="currentColor" className="offer__zap" />
            {offer.badge_text}
          </span>
        )}
        {offer.message && (
          <p className="offer__text" key={offer.message}>
            {offer.message}
          </p>
        )}
        {countdown && (
          <span className="offer__timer" aria-live="off">
            <span key={countdown.slice(-1)} className="offer__tick">
              {countdown}
            </span>
          </span>
        )}
        {offer.link_text && offer.link_url && (
          <a className="offer__link" href={offer.link_url}>
            {offer.link_text}
            <ArrowRight size={14} className="offer__arrow" />
          </a>
        )}
      </div>
    </div>
  )
}
