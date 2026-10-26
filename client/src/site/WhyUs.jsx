import { getIcon } from '../lib/icons'
import SectionHeading from './SectionHeading'
import { revealDelay } from './useScrollReveal'
import RichText from './RichText'

export default function WhyUs({ data }) {
  if (!data?.section) return null
  const { section, features = [] } = data

  return (
    <section id="why-choose-us" className="section section--maroon">
      <div className="container">
        <SectionHeading tagline={section.tagline} heading={section.heading} light />
        {/* As many columns as cards, up to 4 */}
        <div className="why" style={{ '--why-cols': Math.min(Math.max(features.length, 1), 4) }}>
          {features.map((f, i) => {
            const Icon = getIcon(f.icon)
            return (
              <article key={f.id} className="why__card" data-reveal="zoom" style={revealDelay(i)}>
                <span className="why__icon">
                  <Icon size={28} strokeWidth={1.6} />
                </span>
                <h3>{f.title}</h3>
                <p>
                  <RichText text={f.description} />
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
