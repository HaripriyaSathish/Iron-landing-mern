import { getIcon } from '../lib/icons'
import SectionHeading from './SectionHeading'
import { revealDelay } from './useScrollReveal'

export default function WhyUs({ data }) {
  if (!data?.section) return null
  const { section, features = [] } = data

  return (
    <section id="why-choose-us" className="section section--maroon">
      <div className="container">
        <SectionHeading tagline={section.tagline} heading={section.heading} light />
        <div className="why">
          {features.map((f, i) => {
            const Icon = getIcon(f.icon)
            return (
              <article key={f.id} className="why__card" data-reveal="zoom" style={revealDelay(i)}>
                <span className="why__icon">
                  <Icon size={28} strokeWidth={1.6} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
