import { Star } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { revealDelay } from './useScrollReveal'

export default function Testimonials({ data }) {
  if (!data?.section) return null
  const { section, testimonials = [] } = data

  return (
    <section id="reviews" className="section section--cream">
      <div className="container">
        <SectionHeading tagline={section.tagline} heading={section.heading} />
        <div className="reviews">
          {testimonials.map((t, i) => (
            <figure key={t.id} className="review" data-reveal="up" style={revealDelay(i)}>
              <div className="review__stars" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, n) => (
                  <Star key={n} size={14} className={n < t.rating ? 'is-on' : ''} aria-hidden="true" />
                ))}
              </div>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <span className="review__avatar" aria-hidden="true">
                  {t.name.trim().charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{t.name}</strong>
                  {t.role && <small>{t.role}</small>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
