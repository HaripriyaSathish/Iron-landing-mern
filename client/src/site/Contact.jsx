import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { isLink, mapHref, telHref, whatsappHref } from '../lib/contacts'
import { revealDelay } from './useScrollReveal'
import RichText from './RichText'

// labels: the fixed words (Phone, Address…) in the visitor's language
export default function Contact({ data, labels = {} }) {
  if (!data) return null
  const wa = data.whatsapp && whatsappHref(data.whatsapp, data.whatsapp_message)

  // Every detail with a link opens the matching app: dialler, WhatsApp or Google Maps
  const details = [
    { id: 'phone', icon: Phone, label: labels.phone_label || 'Phone', value: data.phone, href: data.phone && telHref(data.phone) },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: labels.whatsapp_label || 'WhatsApp',
      // A Business link is not worth showing as text, so it reads "Chat with us"
      value: data.whatsapp && (isLink(data.whatsapp) ? labels.whatsapp_chat || 'Chat with us' : data.whatsapp),
      href: wa,
      external: true,
    },
    { id: 'address', icon: MapPin, label: labels.address_label || 'Address', value: data.address, href: data.address && mapHref(data.address, data.map_url), external: true },
    { id: 'hours', icon: Clock, label: labels.hours_label || 'Business Hours', value: data.business_hours },
  ].filter((d) => d.value)

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="book">
          <div className="book__main" data-reveal="left">
            <span className="eyebrow">{data.tagline}</span>
            <h2>{data.heading}</h2>
            {data.description && (
              <p>
                <RichText text={data.description} />
              </p>
            )}
            <div className="book__actions">
              {data.primary_btn_text && data.phone && (
                <a href={telHref(data.phone)} className="site-btn site-btn--gold site-btn--lg">
                  {data.primary_btn_text}
                </a>
              )}
              {data.secondary_btn_text && wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="site-btn site-btn--outline-light site-btn--lg">
                  <MessageCircle size={18} />
                  {data.secondary_btn_text}
                </a>
              )}
            </div>
          </div>

          <ul className="book__info">
            {details.map(({ id, icon: Icon, label, value, href, external }, i) => {
              const body = (
                <>
                  <span className="book__icon">
                    <Icon size={19} />
                  </span>
                  <span>
                    <small>{label}</small>
                    <span className="book__value">{value}</span>
                  </span>
                </>
              )
              return (
                <li key={id} data-reveal="right" style={revealDelay(i, 4, 120)}>
                  {href ? (
                    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
                      {body}
                    </a>
                  ) : (
                    <div>{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
