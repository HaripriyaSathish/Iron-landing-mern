import { mailHref, mapHref, telHref } from '../lib/contacts'
import { revealDelay } from './useScrollReveal'

export default function Footer({ data }) {
  if (!data?.settings) return null
  const { settings, logo, links = [], services = [], contact } = data
  const copyright = settings.copyright_text.replaceAll('{year}', new Date().getFullYear())

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand" data-reveal="up">
          <a href="#home" className="footer__logo">
            {logo?.url ? <img src={logo.url} alt={logo.alt || 'Iron Me Ka'} /> : <span>Iron Me Ka</span>}
          </a>
          {settings.about_text && <p>{settings.about_text}</p>}
        </div>

        <nav className="footer__col" aria-label={settings.links_title} data-reveal="up" style={revealDelay(1)}>
          <h3>{settings.links_title}</h3>
          <ul>
            {links.map((l, i) => (
              // Index key: the label changes with the language and must not remount the row
              <li key={`${i}-${l.target}`}>
                <a href={l.target}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col" data-reveal="up" style={revealDelay(2)}>
          <h3>{settings.services_title}</h3>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <a href="#services">{s.title}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col footer__contact" data-reveal="up" style={revealDelay(3)}>
          <h3>{settings.contact_title}</h3>
          <ul>
            {contact?.phone && (
              <li>
                <a href={telHref(contact.phone)} className="footer__phone">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact?.email && (
              <li>
                <a href={mailHref(contact.email)}>{contact.email}</a>
              </li>
            )}
            {contact?.address && (
              <li>
                <a href={mapHref(contact.address, contact.map_url)} target="_blank" rel="noreferrer" className="footer__address">
                  {contact.address}
                </a>
              </li>
            )}
            {settings.hours_short && <li className="footer__hours">{settings.hours_short}</li>}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>{copyright}</span>
          {settings.registration_number && (
            <span className="footer__reg">
              {settings.registration_label && `${settings.registration_label} `}
              {settings.registration_number}
            </span>
          )}
          <span className="footer__credit">
            Designed &amp; Developed by{' '}
            <a href="https://vetriitsystems.com/" target="_blank" rel="noopener">
              Vetri IT Systems
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
