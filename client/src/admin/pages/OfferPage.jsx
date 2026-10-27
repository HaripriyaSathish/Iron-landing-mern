import { useEffect, useState } from 'react'
import { ArrowRight, Info, Megaphone, Save, X, Zap } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader, PageLoader, Toggle } from '../components/ui'

const TEXT_FIELDS = ['badge_text', 'message', 'link_text', 'link_url']

// One-tap starting points the client can edit before saving
const PRESETS = [
  {
    name: 'Free pickup & delivery',
    badge_text: 'Flash Offer',
    message: 'FREE pickup & delivery within 5 km on orders above ₹1500 · Below ₹1500, just ₹100 service charge',
    link_text: 'Book Now',
    link_url: '#contact',
  },
  {
    name: 'Festival discount',
    badge_text: 'Festival Offer',
    message: '10% OFF on saree polishing & rolling this festival week',
    link_text: 'Book Now',
    link_url: '#contact',
  },
  {
    name: 'First order',
    badge_text: 'New Customers',
    message: 'First order? Get 15% OFF on any ironing service',
    link_text: 'Claim Offer',
    link_url: '#contact',
  },
]

// Saved ISO time <-> the "2026-10-31T21:00" value a datetime-local box shows in the admin's own time zone
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : '')

export default function OfferPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  // Page-open time is close enough to tell whether the picked end time has already passed
  const [now] = useState(Date.now)

  const apply = (data) =>
    setForm({
      enabled: !!data.enabled,
      ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, data[k] ?? ''])),
      ends_at: toLocalInput(data.ends_at),
    })

  useEffect(() => {
    api
      .get('/offer/admin')
      .then((res) => apply(res.data.data))
      .catch((err) => toast(errorMessage(err), 'error'))
  }, [toast])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const ended = form.ends_at && new Date(form.ends_at).getTime() <= now

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/offer', { ...form, ends_at: fromLocalInput(form.ends_at) })
      apply(res.data.data)
      toast(form.enabled ? 'Offer is live on your website' : 'Offer saved (switched off)')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        icon={Megaphone}
        title="Flash Offer Banner"
        subtitle="The eye-catching strip at the very top of your website for offers, free pickup and festival deals."
        action={
          <Button type="submit" icon={Save} loading={saving}>
            Save offer
          </Button>
        }
      />

      <Card title="Live preview" subtitle="How the strip looks above your menu.">
        <div className="offer-preview">
          {form.badge_text && (
            <span className="offer-preview__badge">
              <Zap size={12} fill="currentColor" />
              {form.badge_text}
            </span>
          )}
          <span>{form.message || 'Your offer text'}</span>
          {form.ends_at && !ended && <span className="offer-preview__timer">Ends in 2d 04:12:09</span>}
          {form.link_text && (
            <span className="offer-preview__link">
              {form.link_text} <ArrowRight size={13} />
            </span>
          )}
          <X size={15} className="offer-preview__close" />
        </div>
        {!form.enabled && <p className="field__hint mt">Switched off: visitors don&apos;t see the strip.</p>}
        {form.enabled && ended && (
          <p className="field__hint mt">This offer has ended, so the strip is hidden. Clear or change the end time.</p>
        )}
      </Card>

      <div className="grid-2 mt">
        <Card title="Offer words">
          <div className="switch-row">
            <Toggle checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} label="Show the offer strip" />
            <span>Show the offer strip</span>
          </div>

          <Field label="Quick start" hint="Fills in a ready-made offer. Change the words, then save.">
            <div className="chips chips--buttons">
              {PRESETS.map(({ name, ...preset }) => (
                <button key={name} type="button" className="chip" onClick={() => setForm({ ...form, ...preset })}>
                  {name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Badge" hint="The small gold tag, e.g. Flash Offer, Limited Time." count={form.badge_text.length} max={40}>
            <input className="input" maxLength={40} value={form.badge_text} onChange={set('badge_text')} />
          </Field>
          <Field label="Offer text" count={form.message.length} max={255}>
            <textarea className="input" rows={3} required maxLength={255} value={form.message} onChange={set('message')} />
          </Field>
        </Card>

        <Card title="Button & timing">
          <div className="row-2">
            <Field label="Button text" hint="Leave empty for no button.">
              <input className="input" maxLength={40} value={form.link_text} onChange={set('link_text')} />
            </Field>
            <Field label="Button link" hint="#contact jumps to Book Today. A full https:// link also works.">
              <input className="input" value={form.link_url} onChange={set('link_url')} />
            </Field>
          </div>
          <Field label="Offer ends on (optional)" hint="Shows a live countdown and hides the strip by itself when time is up.">
            <input className="input" type="datetime-local" value={form.ends_at} onChange={set('ends_at')} />
          </Field>
          {form.ends_at && (
            <Button type="button" variant="ghost" icon={X} onClick={() => setForm({ ...form, ends_at: '' })}>
              No end time
            </Button>
          )}
          <p className="note mt">
            <Info size={16} />
            <span>
              Visitors can close the strip with ✕. It stays closed for that visit, and shows again whenever you save a
              new offer. Tamil and French words go in Languages → Flash Offer.
            </span>
          </p>
        </Card>
      </div>
    </form>
  )
}
