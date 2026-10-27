import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PanelBottom, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { SOCIALS } from '../../lib/socials'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  Modal,
  MoveButtons,
  PageHeader,
  PageLoader,
  Toggle,
} from '../components/ui'
import { moveItem } from '../utils'

const FIELDS = [
  'about_text',
  'links_title',
  'services_title',
  'services_limit',
  'contact_title',
  'hours_short',
  'socials_title',
  'copyright_text',
]
const emptySocial = { platform: 'instagram', url: 'https://', is_active: true }

// Parts of the footer that come from other pages, so they are edited in one place
const REUSED = [
  { what: 'Logo', where: 'Navbar & Menu', path: '/admin/menu' },
  { what: 'Quick links', where: 'Navbar & Menu', path: '/admin/menu' },
  { what: 'Services list', where: 'Services & Prices', path: '/admin/services' },
  { what: 'Phone, email & address', where: 'Contact & Booking', path: '/admin/contact' },
]

export default function FooterPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [socials, setSocials] = useState([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/footer/admin')
        .then((res) => {
          const s = res.data.data.settings
          setForm(Object.fromEntries(FIELDS.map((k) => [k, s[k] ?? ''])))
          setSocials(res.data.data.socials)
        })
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/footer/settings', form)
      toast('Footer saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveSocial = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, platform, url, is_active } = editing
      if (id) await api.put(`/footer/socials/${id}`, { platform, url, is_active })
      else await api.post('/footer/socials', { platform, url, is_active })
      toast(id ? 'Social link updated' : 'Social link added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (s) => {
    setSocials((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/footer/socials/${s.id}`, { is_active: !s.is_active })
      toast(s.is_active ? `${SOCIALS[s.platform].label} hidden` : `${SOCIALS[s.platform].label} is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(socials, index, step)
    setSocials(next)
    try {
      await api.put('/footer/socials/reorder', { ids: next.map((s) => s.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/footer/socials/${deleting.id}`)
      toast('Social link deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <>
      <PageHeader
        icon={PanelBottom}
        title="Footer"
        subtitle="The dark strip at the bottom of every page: your short intro, social links and copyright line."
      />

      <div className="grid-2 grid-2--wide-left">
        <form onSubmit={saveSettings}>
          <Card title="Footer words">
            <Field label="Short intro under the logo" count={form.about_text.length} max={160}>
              <textarea className="input" rows={3} value={form.about_text} onChange={set('about_text')} />
            </Field>
            <div className="row-3">
              <Field label="Links column title">
                <input className="input" required value={form.links_title} onChange={set('links_title')} />
              </Field>
              <Field label="Services column title">
                <input className="input" required value={form.services_title} onChange={set('services_title')} />
              </Field>
              <Field label="Contact column title">
                <input className="input" required value={form.contact_title} onChange={set('contact_title')} />
              </Field>
            </div>
            <div className="row-2">
              <Field label="How many services to list" hint="Taken from the top of Services & Prices.">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.services_limit}
                  onChange={set('services_limit')}
                />
              </Field>
              <Field label="Short opening hours" hint="A shorter version for the footer.">
                <input className="input" value={form.hours_short} onChange={set('hours_short')} />
              </Field>
            </div>
            <Field label="Heading above the social icons" hint="e.g. Follow Us. Leave empty to show the icons without a heading.">
              <input className="input" value={form.socials_title} onChange={set('socials_title')} />
            </Field>
            <Field label="Copyright line" hint={`Type {year} for the current year. Shows as: ${form.copyright_text.replaceAll('{year}', year)}`}>
              <input className="input" required value={form.copyright_text} onChange={set('copyright_text')} />
            </Field>
            <div className="card__foot">
              <span />
              <Button type="submit" icon={Save} loading={saving}>
                Save footer
              </Button>
            </div>
          </Card>
        </form>

        <div className="stack">
          <Card title="Social links" subtitle="The round icons under your intro.">
            {socials.length === 0 ? (
              <EmptyState icon={PanelBottom} title="No social links" text="Add your Instagram, YouTube, WhatsApp or Telegram." />
            ) : (
              <ul className="list">
                {socials.map((s, i) => {
                  const { icon: Icon, label } = SOCIALS[s.platform] ?? SOCIALS.website
                  return (
                    <li key={s.id} className={`list-row ${s.is_active ? '' : 'is-muted'}`}>
                      <MoveButtons index={i} total={socials.length} onMove={move} />
                      <span className="social-dot">
                        <Icon size={18} />
                      </span>
                      <div className="list-row__main">
                        <strong>{label}</strong>
                        <small>{s.url}</small>
                      </div>
                      <Toggle checked={!!s.is_active} onChange={() => toggle(s)} label="Show on website" />
                      <IconButton
                        icon={Pencil}
                        label="Edit"
                        onClick={() => setEditing({ ...s, is_active: !!s.is_active })}
                      />
                      <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setDeleting(s)} />
                    </li>
                  )
                })}
              </ul>
            )}
            <Button variant="ghost" icon={Plus} onClick={() => setEditing({ ...emptySocial })}>
              Add social link
            </Button>
          </Card>

          <Card title="Filled in for you" subtitle="These parts update automatically from other pages.">
            <ul className="reused">
              {REUSED.map(({ what, where, path }) => (
                <li key={what}>
                  <span>{what}</span>
                  <Link to={path}>
                    {where} <ArrowRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Edit social link' : 'New social link'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="social-form" icon={Save} loading={busy}>
                Save link
              </Button>
            </>
          }
        >
          <form id="social-form" onSubmit={saveSocial}>
            <div className="type-picker type-picker--8">
              {Object.entries(SOCIALS).map(([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  className={`type-picker__opt ${editing.platform === key ? 'is-active' : ''}`}
                  onClick={() => setEditing({ ...editing, platform: key })}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
            <Field
              label="Profile link"
              hint={SOCIALS[editing.platform]?.hint ?? 'Open your profile in a browser and copy the address.'}
            >
              <input
                className="input"
                required
                autoFocus
                value={editing.url}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              />
            </Field>
            <div className="switch-row">
              <Toggle
                checked={editing.is_active}
                onChange={(v) => setEditing({ ...editing, is_active: v })}
                label="Show on website"
              />
              <span>Show on website</span>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this social link?"
          message={`Your ${SOCIALS[deleting.platform]?.label ?? ''} link will be removed from the footer.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
