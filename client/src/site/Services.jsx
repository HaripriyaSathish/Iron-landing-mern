import SectionHeading from './SectionHeading'
import { revealDelay } from './useScrollReveal'

const cardNumber = (i) => String(i + 1).padStart(2, '0')
const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`

export default function Services({ data }) {
  if (!data?.section) return null
  const { section, services = [] } = data

  return (
    <section id="services" className="section section--cream">
      <div className="container">
        <SectionHeading tagline={section.tagline} heading={section.heading} sub={section.subheading} />
        <div className="services">
          {services.map((s, i) => (
            <article key={s.id} className="service" data-reveal="up" style={revealDelay(i, 5)}>
              <div className="service__media">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.image_alt || s.title} loading="lazy" />
                ) : (
                  <div className="service__fallback" />
                )}
                <span className="service__num">{cardNumber(i)}</span>
              </div>
              <div className="service__body">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="service__foot">
                  {s.price !== null && (
                    <div className="service__price">
                      {section.price_label && <small>{section.price_label}</small>}
                      <strong>{formatPrice(s.price)}</strong>
                    </div>
                  )}
                  {section.btn_text && (
                    <a href={section.btn_link || '#contact'} className="site-btn site-btn--outline site-btn--sm">
                      {section.btn_text}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
