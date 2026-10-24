import { useCallback, useEffect, useState } from 'react'
import { HeartHandshake, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { getIcon } from '../../lib/icons'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  IconPicker,
  Modal,
  MoveButtons,
  PageHeader,
  PageLoader,
  Toggle,
} from '../components/ui'
import { moveItem } from '../utils'

const emptyFeature = { icon: 'ShieldCheck', title: '', description: '', is_active: true }

export default function PromisePage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [features, setFeatures] = useState([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/why-us/admin')
        .then((res) => {
          const s = res.data.data.section
          setForm({ tagline: s.tagline ?? '', heading: s.heading ?? '' })
          setFeatures(res.data.data.features)
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
      await api.put('/why-us/section', form)
      toast('Section heading saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveFeature = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, icon, title, description, is_active } = editing
      if (id) await api.put(`/why-us/features/${id}`, { icon, title, description, is_active })
      else await api.post('/why-us/features', { icon, title, description, is_active })
      toast(id ? 'Reason updated' : 'Reason added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (f) => {
    setFeatures((list) => list.map((x) => (x.id === f.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/why-us/features/${f.id}`, { is_active: !f.is_active })
      toast(f.is_active ? `"${f.title}" hidden` : `"${f.title}" is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(features, index, step)
    setFeatures(next)
    try {
      await api.put('/why-us/features/reorder', { ids: next.map((f) => f.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/why-us/features/${deleting.id}`)
      toast('Reason deleted')
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
        icon={HeartHandshake}
        title="Why Choose Us"
        subtitle="The reasons customers can trust you with their fabrics."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptyFeature })}>
            Add reason
          </Button>
        }
      />

      <form onSubmit={saveSection}>
        <Card title="Section heading">
          <div className="row-2">
            <Field label="Small heading" hint="The gold line, e.g. WHY CHOOSE US">
              <input className="input" required value={form.tagline} onChange={set('tagline')} />
            </Field>
            <Field label="Main heading">
              <input className="input" required value={form.heading} onChange={set('heading')} />
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
          Your reasons <span className="count-pill">{features.length}</span>
        </h2>
        <span className="field__hint">Four in a row looks best on the website.</span>
      </div>

      {features.length === 0 ? (
        <Card>
          <EmptyState icon={HeartHandshake} title="No reasons yet" text="Add what makes customers choose you." />
        </Card>
      ) : (
        <div className="promise-board">
          <div className="promise-board__head">
            <span>{form.tagline}</span>
            <h3>{form.heading}</h3>
          </div>
          <div className="promise-grid">
            {features.map((f, i) => {
              const Icon = getIcon(f.icon)
              return (
                <article key={f.id} className={`promise-card ${f.is_active ? '' : 'is-muted'}`}>
                  <span className="promise-card__icon">
                    <Icon size={24} />
                  </span>
                  <h4>{f.title}</h4>
                  <p>{f.description}</p>
                  <div className="promise-card__bar">
                    <MoveButtons index={i} total={features.length} onMove={move} />
                    <Toggle checked={!!f.is_active} onChange={() => toggle(f)} label="Show on website" />
                    <IconButton
                      icon={Pencil}
                      label="Edit reason"
                      onClick={() => setEditing({ ...f, is_active: !!f.is_active })}
                    />
                    <IconButton icon={Trash2} label="Delete reason" variant="danger" onClick={() => setDeleting(f)} />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Edit reason' : 'New reason'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="feature-form" icon={Save} loading={busy}>
                Save reason
              </Button>
            </>
          }
        >
          <form id="feature-form" onSubmit={saveFeature}>
            <Field label="Title">
              <input
                className="input"
                required
                autoFocus
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="Short description" count={editing.description.length} max={90}>
              <textarea
                className="input"
                rows={2}
                required
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <span className="field__label">Icon</span>
            <IconPicker value={editing.icon} onChange={(icon) => setEditing({ ...editing, icon })} />
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
          title="Delete this reason?"
          message={`"${deleting.title}" will be removed from your website. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
