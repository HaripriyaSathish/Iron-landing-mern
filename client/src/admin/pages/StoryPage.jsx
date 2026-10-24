import { useCallback, useEffect, useState } from 'react'
import { BookHeart, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage, toFormData } from '../../lib/api'
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
  ImageUpload,
  Modal,
  MoveButtons,
  PageHeader,
  PageLoader,
  Toggle,
} from '../components/ui'
import { moveItem } from '../utils'

const TEXT_FIELDS = ['tagline', 'heading', 'content', 'image_alt', 'badge_value', 'badge_label']
const emptyHighlight = { icon: 'Sparkles', title: '', is_active: true }

export default function StoryPage() {
  const toast = useToast()
  const [section, setSection] = useState(null)
  const [form, setForm] = useState(null)
  const [image, setImage] = useState({ file: null, removed: false })
  const [highlights, setHighlights] = useState([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const applySection = (s) => {
    setSection(s)
    setForm(Object.fromEntries(TEXT_FIELDS.map((k) => [k, s[k] ?? ''])))
    setImage({ file: null, removed: false })
  }

  const load = useCallback(
    () =>
      api
        .get('/about/admin')
        .then((res) => {
          applySection(res.data.data.section)
          setHighlights(res.data.data.highlights)
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
      const res = await api.put(
        '/about',
        toFormData({ ...form, image: image.file || undefined, remove_image: image.removed || undefined }),
      )
      applySection(res.data.data)
      toast('About Us saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveHighlight = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, icon, title, is_active } = editing
      if (id) await api.put(`/about/highlights/${id}`, { icon, title, is_active })
      else await api.post('/about/highlights', { icon, title, is_active })
      toast(id ? 'Highlight updated' : 'Highlight added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (h) => {
    setHighlights((list) => list.map((x) => (x.id === h.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/about/highlights/${h.id}`, { is_active: !h.is_active })
      toast(h.is_active ? `"${h.title}" hidden` : `"${h.title}" is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(highlights, index, step)
    setHighlights(next)
    try {
      await api.put('/about/highlights/reorder', { ids: next.map((h) => h.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/about/highlights/${deleting.id}`)
      toast('Highlight deleted')
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
        icon={BookHeart}
        title="About Us"
        subtitle="Who you are, why customers trust you, and a photo of your craft."
      />

      <form onSubmit={saveSection}>
        <div className="grid-2">
          <Card title="Photo & badge" subtitle="The large photo and the maroon badge on its corner.">
            <ImageUpload
              label="Upload story photo"
              value={section.image_url}
              file={image.file}
              removed={image.removed}
              onPick={(file) => setImage({ file, removed: false })}
              onRemove={() => setImage({ file: null, removed: true })}
              ratio="4 / 5"
              hint="Portrait photo works best, at least 900 × 1100 px."
            />
            <Field label="Photo description" hint="Helps Google and screen readers.">
              <input className="input" value={form.image_alt} onChange={set('image_alt')} />
            </Field>
            <div className="row-2">
              <Field label="Badge number" hint="e.g. 12+">
                <input className="input" value={form.badge_value} onChange={set('badge_value')} />
              </Field>
              <Field label="Badge text" hint="e.g. Years of Care">
                <input className="input" value={form.badge_label} onChange={set('badge_label')} />
              </Field>
            </div>
            {form.badge_value && (
              <div className="badge-preview">
                <strong>{form.badge_value}</strong>
                <span>{form.badge_label}</span>
              </div>
            )}
          </Card>

          <Card title="Words" subtitle="Leave an empty line between paragraphs.">
            <Field label="Small heading" hint="The gold line above the title, e.g. ABOUT US">
              <input className="input" required value={form.tagline} onChange={set('tagline')} />
            </Field>
            <Field label="Main heading">
              <input className="input" required value={form.heading} onChange={set('heading')} />
            </Field>
            <Field label="Your story" count={form.content.length} max={900}>
              <textarea className="input" rows={10} required value={form.content} onChange={set('content')} />
            </Field>
            <div className="card__foot">
              <span />
              <Button type="submit" icon={Save} loading={saving}>
                Save story
              </Button>
            </div>
          </Card>
        </div>
      </form>

      <Card
        className="mt"
        title="Highlights"
        subtitle="The small cards under your story. Three looks best on the website."
      >
        {highlights.length === 0 ? (
          <EmptyState icon={BookHeart} title="No highlights yet" text="Add what makes your service special." />
        ) : (
          <ul className="list">
            {highlights.map((h, i) => {
              const Icon = getIcon(h.icon)
              return (
                <li key={h.id} className={`list-row ${h.is_active ? '' : 'is-muted'}`}>
                  <MoveButtons index={i} total={highlights.length} onMove={move} />
                  <span className="highlight-icon">
                    <Icon size={20} />
                  </span>
                  <div className="list-row__main">
                    <strong>{h.title}</strong>
                  </div>
                  <Toggle checked={!!h.is_active} onChange={() => toggle(h)} label="Show on website" />
                  <IconButton
                    icon={Pencil}
                    label="Edit"
                    onClick={() => setEditing({ ...h, is_active: !!h.is_active })}
                  />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setDeleting(h)} />
                </li>
              )
            })}
          </ul>
        )}
        <Button variant="ghost" icon={Plus} onClick={() => setEditing({ ...emptyHighlight })}>
          Add highlight
        </Button>
      </Card>

      {editing && (
        <Modal
          title={editing.id ? 'Edit highlight' : 'New highlight'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="highlight-form" icon={Save} loading={busy}>
                Save highlight
              </Button>
            </>
          }
        >
          <form id="highlight-form" onSubmit={saveHighlight}>
            <Field label="Title">
              <input
                className="input"
                required
                autoFocus
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
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
          title="Delete this highlight?"
          message={`"${deleting.title}" will be removed from your website.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
