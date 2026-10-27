import { ArrowUpRight } from 'lucide-react'
import { SOCIALS } from '../lib/socials'
import { revealDelay } from './useScrollReveal'

// "Follow Us" section just above the footer: one card per social link, each in its brand colour
export default function FollowUs({ data }) {
  const socials = data?.socials ?? []
  if (!socials.length) return null
  const { socials_title: title, socials_text: text } = data.settings ?? {}

  return (
    <section className="follow" aria-label={title || 'Follow us'}>
      <div className="container">
        {title && (
          <h2 className="follow__title" data-reveal="up">
            {title}
          </h2>
        )}
        {text && (
          <p className="follow__text" data-reveal="up" style={revealDelay(1)}>
            {text}
          </p>
        )}
        <ul className="follow__list">
          {socials.map((s, i) => {
            const { icon: Icon, label, color } = SOCIALS[s.platform] ?? SOCIALS.website
            return (
              <li key={s.id} data-reveal="up" style={revealDelay(i + 1)}>
                <a className="follow__card" href={s.url} target="_blank" rel="noreferrer" style={{ '--brand': color }}>
                  <span className="follow__icon">
                    <Icon size={30} />
                  </span>
                  <span className="follow__name">{label}</span>
                  <ArrowUpRight size={16} className="follow__go" aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
