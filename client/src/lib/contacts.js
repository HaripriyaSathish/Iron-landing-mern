// Click-to-act links shared by the website and the admin previews

const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')

// Keeps a leading + so numbers typed without a country code still dial locally
export const telHref = (phone) => `tel:${String(phone ?? '').replace(/[^\d+]/g, '')}`

export const isLink = (value) => /^https?:\/\//i.test(String(value ?? '').trim())

// number: a WhatsApp number, or a ready-made wa.me link (business links carry their own message)
export function whatsappHref(number, message) {
  if (isLink(number)) return String(number).trim()
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digitsOnly(number)}${text}`
}

export const mailHref = (email) => `mailto:${email}`

// A saved map link wins; otherwise search Google Maps for the address
export function mapHref(address, mapUrl) {
  if (mapUrl) return mapUrl
  const query = String(address ?? '').replace(/\s*\n\s*/g, ' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// The link a visitor's tap on a quick-connect button opens
export function contactHref({ type, value, message }) {
  if (type === 'email') return mailHref(value)
  if (type === 'call') return telHref(value)
  return whatsappHref(value, message)
}
