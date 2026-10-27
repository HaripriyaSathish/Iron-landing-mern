import { getIcon } from '../lib/icons'
import RichText from './RichText'

// Copies of the list in one half of the track, so even a short list fills a wide screen
const REPEAT = 4

function Group({ items, hidden }) {
  return (
    <ul className="ticker__group" aria-hidden={hidden || undefined}>
      {Array.from({ length: REPEAT }, (_, copy) =>
        items.map((item) => {
          const Icon = getIcon(item.icon)
          return (
            <li key={`${copy}-${item.id}`} className="ticker__item">
              <span className="ticker__icon">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="ticker__text">
                <RichText text={item.text} />
              </span>
              <span className="ticker__star" aria-hidden="true">
                ✦
              </span>
            </li>
          )
        }),
      )}
    </ul>
  )
}

// Moving line of selling points under the hero.
// The track holds two identical halves and slides left by one half, so the loop never shows a gap.
// Pauses while pointed at.
export default function Ticker({ items }) {
  if (!items?.length) return null

  return (
    <section className="ticker" aria-label="Offers">
      <div className="ticker__viewport">
        <div className="ticker__track" style={{ '--ticker-time': `${items.length * REPEAT * 6}s` }}>
          <Group items={items} />
          <Group items={items} hidden />
        </div>
      </div>
    </section>
  )
}
