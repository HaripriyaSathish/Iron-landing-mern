import { useEffect, useState } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone, PhoneCall, Save } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { isLink, mailHref, mapHref, telHref, whatsappHref } from '../../lib/contacts'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader, PageLoader } from '../components/ui'

const FIELDS = [
  'tagline',
  'heading',
  'description',
  'primary_btn_text',
  'secondary_btn_text',
  'phone',
  'whatsapp',
  'whatsapp_message',
  'email',
  'address',
  'map_url',
  'business_hours',
]

export default function ContactPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/contact')
      .then((res) => setForm(Object.fromEntries(FIELDS.map((k) => [k, res.data.data[k] ?? '']))))
      .catch((err) => toast(errorMessage(err), 'error'))
  }, [toast])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/contact', form)
      toast('Contact & booking saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  // What each website button and icon will open, built from the unsaved form so changes can be tested first
  const tests = [
    { icon: Phone, label: 'Call', detail: form.phone, href: form.phone && telHref(form.phone) },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      detail: form.whatsapp,
      href: form.whatsapp && whatsappHref(form.whatsapp, form.whatsapp_message),
    },
    { icon: MapPin, label: 'Open map', detail: 'Google Maps', href: form.address && mapHref(form.address, form.map_url) },
    { icon: Mail, label: 'Email', detail: form.email, href: form.email && mailHref(form.email) },
  ]

  return (
    <form onSubmit={save}>
      <PageHeader
        icon={PhoneCall}
        title="Contact & Booking"
        subtitle="The Book Today section, and the phone, WhatsApp, address and hours used across your website."
        action={
          <Button type="submit" icon={Save} loading={saving}>
            Save changes
          </Button>
        }
      />

      <div className="grid-2 grid-2--wide-left">
        <div className="stack">
          <Card title="Book Today block" subtitle="The maroon box that invites visitors to book.">
            <div className="row-2">
              <Field label="Small heading" hint="The gold line, e.g. BOOK TODAY">
                <input className="input" required value={form.tagline} onChange={set('tagline')} />
              </Field>
              <Field label="Main heading">
                <input className="input" required value={form.heading} onChange={set('heading')} />
              </Field>
            </div>
            <Field label="Short description" count={form.description.length} max={400} hint="Wrap words in **double stars** to highlight them in bold.">
              <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
            </Field>
            <div className="row-2">
              <Field label="Gold button text" hint="Calls your phone number">
                <input className="input" value={form.primary_btn_text} onChange={set('primary_btn_text')} />
              </Field>
              <Field label="Outline button text" hint="Opens a WhatsApp chat">
                <input className="input" value={form.secondary_btn_text} onChange={set('secondary_btn_text')} />
              </Field>
            </div>
          </Card>

          <Card title="Your contact details" subtitle="Shown here and in the footer. Leave a field empty to hide it.">
            <div className="row-2">
              <Field label="Phone number" hint="With country code, e.g. +91 8220695123">
                <input className="input" inputMode="tel" value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label="WhatsApp number or link" hint="Number with country code, or your Business link (https://wa.me/message/…)">
                <input className="input" value={form.whatsapp} onChange={set('whatsapp')} />
              </Field>
            </div>
            {/* Business links bring their own message, so this only applies to numbers */}
            {!isLink(form.whatsapp) && (
              <Field label="Ready-made WhatsApp message" hint="Pre-filled when a customer opens the chat.">
                <input className="input" value={form.whatsapp_message} onChange={set('whatsapp_message')} />
              </Field>
            )}
            <Field label="Email address">
              <input className="input" type="email" value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Address" hint="Press Enter for a new line, exactly as it should appear.">
              <textarea className="input" rows={3} value={form.address} onChange={set('address')} />
            </Field>
            <Field
              label="Google Maps link (optional)"
              hint="Paste your shop's Share link from Google Maps. If empty, the map searches your address."
            >
              <input className="input" value={form.map_url} onChange={set('map_url')} placeholder="https://maps.app.goo.gl/…" />
            </Field>
            <Field label="Business hours">
              <input className="input" value={form.business_hours} onChange={set('business_hours')} />
            </Field>
          </Card>
        </div>

        <div className="stack">
          <Card title="Test your links" subtitle="Tap to check what visitors will get. Works before saving too.">
            <div className="link-tests">
              {tests.map(({ icon: Icon, label, detail, href }) =>
                href ? (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="link-test">
                    <span className="link-test__icon">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>
                  </a>
                ) : (
                  <div key={label} className="link-test is-off">
                    <span className="link-test__icon">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{label}</strong>
                      <small>Not set</small>
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>

          <Card title="On your website" subtitle="Roughly how the details column looks.">
            <ul className="info-preview">
              {[
                [Phone, 'Phone', form.phone],
                [MessageCircle, 'WhatsApp', form.whatsapp],
                [MapPin, 'Address', form.address],
                [Clock, 'Business hours', form.business_hours],
              ]
                .filter(([, , value]) => value)
                .map(([Icon, label, value]) => (
                  <li key={label}>
                    <span className="info-preview__icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <small>{label}</small>
                      <p>{value}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </div>
    </form>
  )
}
