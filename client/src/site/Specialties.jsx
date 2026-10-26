import { CircleCheck } from 'lucide-react'
import { revealDelay } from './useScrollReveal'
import RichText from './RichText'

const paragraphs = (text) => String(text ?? '').split(/\n\s*\n|\r?\n/).filter((p) => p.trim())

// "Silk Saree Polish: A gentle…" → bold "Silk Saree Polish", then the rest (French writes "Titre : texte")
function splitPoint(line) {
  const match = line.match(/^(.{2,90}?)\s*:\s+(.+)$/)
  return match ? { term: match[1], text: match[2] } : { term: null, text: line }
}

// Offer blocks (Premium Saree Polish, B2B for hotels…), alternating sides down the page
export default function Specialties({ blocks = [] }) {
  if (!blocks.length) return null

  return (
    <section id="specialties" className="section specialties">
      <div className="container">
        {blocks.map((b, i) => {
          const points = paragraphs(b.points).map(splitPoint)
          return (
            <article key={b.id} className={`spec ${i % 2 ? 'spec--flip' : ''} ${b.image_url ? 'spec--image' : ''}`}>
              {b.image_url && (
                <div className="spec__media" data-reveal={i % 2 ? 'right' : 'left'}>
                  <img src={b.image_url} alt={b.image_alt || b.title} loading="lazy" />
                </div>
              )}
              <div className="spec__text" data-reveal={i % 2 ? 'left' : 'right'}>
                {b.tagline && <span className="eyebrow">{b.tagline}</span>}
                <h2>{b.title}</h2>
                <span className="ornament ornament--left" aria-hidden="true">
                  <i />
                  <b />
                  <i />
                </span>
                {paragraphs(b.intro).map((p, n) => (
                  <p key={n}>
                    <RichText text={p} />
                  </p>
                ))}
              </div>
              {points.length > 0 && (
                <ul className="spec__points">
                  {points.map((p, n) => (
                    <li key={n} data-reveal="up" style={revealDelay(n, 3, 120)}>
                      <span className="spec__icon">
                        <CircleCheck size={20} strokeWidth={1.8} />
                      </span>
                      <span>
                        {p.term && <strong>{p.term}</strong>}
                        <RichText text={p.text} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
