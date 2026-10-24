import { getIcon } from '../lib/icons'
import { revealDelay } from './useScrollReveal'

export default function About({ data }) {
  if (!data?.section) return null
  const { section, highlights = [] } = data
  const paragraphs = section.content.split(/\n\s*\n/).filter((p) => p.trim())

  return (
    <section id="about" className="section about">
      <div className="container about__grid">
        <div className="about__media" data-reveal="left">
          <div className="about__frame" aria-hidden="true" />
          <div className="about__photo">
            {section.image_url ? (
              <img src={section.image_url} alt={section.image_alt || ''} loading="lazy" />
            ) : (
              <div className="about__photo-fallback" />
            )}
          </div>
          {section.badge_value && (
            <div className="about__badge">
              <strong>{section.badge_value}</strong>
              <span>{section.badge_label}</span>
            </div>
          )}
        </div>

        <div className="about__text" data-reveal="right">
          <span className="eyebrow">{section.tagline}</span>
          <h2>{section.heading}</h2>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {highlights.length > 0 && (
            <ul className="about__highlights">
              {highlights.map((h, i) => {
                const Icon = getIcon(h.icon)
                return (
                  <li key={h.id} data-reveal="up" style={revealDelay(i, 3)}>
                    <Icon size={24} strokeWidth={1.6} />
                    <span>{h.title}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
