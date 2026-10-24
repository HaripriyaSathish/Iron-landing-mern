import { Mail, MessageCircle, Phone } from 'lucide-react'
import { contactHref } from '../lib/contacts'

const ICONS = { call: Phone, whatsapp: MessageCircle, email: Mail }

// Round call / WhatsApp / email buttons fixed to the corner of the screen
export default function FloatingContacts({ contacts = [] }) {
  if (!contacts.length) return null

  return (
    <div className="floaters">
      {contacts.map((c) => {
        const Icon = ICONS[c.type] ?? Phone
        const external = c.type === 'whatsapp'
        return (
          <a
            key={c.id}
            href={contactHref(c)}
            className={`floater floater--${c.type}`}
            aria-label={c.label}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
          >
            <Icon size={22} />
            <span className="floater__label">{c.label}</span>
          </a>
        )
      })}
    </div>
  )
}
