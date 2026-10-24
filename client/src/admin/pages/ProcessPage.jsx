import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Route, Save, Trash2 } from 'lucide-react'
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

const emptyStep = { icon: 'ClipboardList', title: '', description: '', is_active: true }
const stepNumber = (i) => String(i + 1).padStart(2, '0')

export default function ProcessPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [steps, setSteps] = useState([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/how-it-works/admin')
        .then((res) => {
          const s = res.data.data.section
          setForm({ tagline: s.tagline ?? '', heading: s.heading ?? '' })
          setSteps(res.data.data.steps)
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
      await api.put('/how-it-works/section', form)
      toast('Section heading saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveStep = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, icon, title, description, is_active } = editing
      if (id) await api.put(`/how-it-works/steps/${id}`, { icon, title, description, is_active })
      else await api.post('/how-it-works/steps', { icon, title, description, is_active })
      toast(id ? 'Step updated' : 'Step added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (s) => {
    setSteps((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/how-it-works/steps/${s.id}`, { is_active: !s.is_active })
      toast(s.is_active ? `"${s.title}" hidden` : `"${s.title}" is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(steps, index, step)
    setSteps(next)
    try {
      await api.put('/how-it-works/steps/reorder', { ids: next.map((s) => s.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/how-it-works/steps/${deleting.id}`)
      toast('Step deleted')
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
        icon={Route}
        title="How It Works"
        subtitle="The simple steps from booking to fresh, ready-to-wear clothes."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptyStep })}>
            Add step
          </Button>
        }
      />

      <form onSubmit={saveSection}>
        <Card title="Section heading">
          <div className="row-2">
            <Field label="Small heading" hint="The gold line, e.g. HOW IT WORKS">
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
          Your steps <span className="count-pill">{steps.length}</span>
        </h2>
        <span className="field__hint">Step numbers follow the order. Four steps fit best in one line.</span>
      </div>

      {steps.length === 0 ? (
        <Card>
          <EmptyState icon={Route} title="No steps yet" text="Add the steps customers follow." />
        </Card>
      ) : (
        <Card>
          <div className="timeline">
            {steps.map((s, i) => {
              const Icon = getIcon(s.icon)
              return (
                <article key={s.id} className={`timeline__step ${s.is_active ? '' : 'is-muted'}`}>
                  <span className="timeline__icon">
                    <Icon size={24} />
                  </span>
                  <span className="timeline__num">{stepNumber(i)}</span>
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                  <div className="timeline__bar">
                    <MoveButtons index={i} total={steps.length} onMove={move} />
                    <Toggle checked={!!s.is_active} onChange={() => toggle(s)} label="Show on website" />
                    <IconButton
                      icon={Pencil}
                      label="Edit step"
                      onClick={() => setEditing({ ...s, is_active: !!s.is_active })}
                    />
                    <IconButton icon={Trash2} label="Delete step" variant="danger" onClick={() => setDeleting(s)} />
                  </div>
                </article>
              )
            })}
          </div>
        </Card>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Edit step' : 'New step'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="step-form" icon={Save} loading={busy}>
                Save step
              </Button>
            </>
          }
        >
          <form id="step-form" onSubmit={saveStep}>
            <Field label="Step title">
              <input
                className="input"
                required
                autoFocus
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="Short description" count={editing.description.length} max={80}>
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
          title="Delete this step?"
          message={`"${deleting.title}" will be removed from your website. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
