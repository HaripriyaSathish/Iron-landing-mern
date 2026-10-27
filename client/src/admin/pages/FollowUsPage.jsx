import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Save, Share2, Trash2 } from 'lucide-react'
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

// The section's words are stored with the footer settings; the links are the footer's social links
const emptySocial = { platform: 'instagram', url: 'https://', is_active: true }

export default function FollowUsPage() {
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
          setForm({ socials_title: s.socials_title ?? '', socials_text: s.socials_text ?? '' })
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

  const saveSection = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/footer/settings', form)
      toast('Section heading saved')
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

  return (
    <>
      <PageHeader
        icon={Share2}
        title="Follow Us"
        subtitle="The section just above the footer with a card for each of your social pages."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptySocial })}>
            Add social link
          </Button>
        }
      />

      <form onSubmit={saveSection}>
        <Card title="Section heading">
          <div className="row-2">
            <Field label="Main heading" hint="e.g. Follow Us">
              <input className="input" required value={form.socials_title} onChange={set('socials_title')} />
            </Field>
            <Field label="Line under the heading" hint="Leave empty for no line." count={form.socials_text.length} max={160}>
              <input className="input" maxLength={160} value={form.socials_text} onChange={set('socials_text')} />
            </Field>
          </div>
          <div className="card__foot">
            <span />
            <Button type="submit" icon={Save} loading={saving}>
              Save heading
            </Button>
          </div>
        </Card>
      </form>

      <div className="section-bar">
        <h2>
          Your social links <span className="count-pill">{socials.length}</span>
        </h2>
        <span className="field__hint">The cards show in this order. Switch one off to hide it for now.</span>
      </div>

      <Card>
        {socials.length === 0 ? (
          <EmptyState icon={Share2} title="No social links" text="Add your Instagram, YouTube, WhatsApp or Telegram." />
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
                  <IconButton icon={Pencil} label="Edit" onClick={() => setEditing({ ...s, is_active: !!s.is_active })} />
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
          message={`Your ${SOCIALS[deleting.platform]?.label ?? ''} card will be removed from the Follow Us section.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
