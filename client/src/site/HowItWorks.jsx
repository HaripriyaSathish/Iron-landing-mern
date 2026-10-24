import { getIcon } from '../lib/icons'
import SectionHeading from './SectionHeading'
import { revealDelay } from './useScrollReveal'

const stepNumber = (i) => String(i + 1).padStart(2, '0')

export default function HowItWorks({ data }) {
  if (!data?.section) return null
  const { section, steps = [] } = data

  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <SectionHeading tagline={section.tagline} heading={section.heading} />
        <ol className="steps">
          {steps.map((s, i) => {
            const Icon = getIcon(s.icon)
            return (
              <li key={s.id} className="step" data-reveal="up" style={revealDelay(i, 4, 160)}>
                <span className="step__icon">
                  <Icon size={28} strokeWidth={1.6} />
                </span>
                <span className="step__num">{stepNumber(i)}</span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
