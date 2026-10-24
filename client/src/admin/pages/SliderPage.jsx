import { useCallback, useEffect, useState } from 'react'
import { ImageOff, Images, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage, toFormData } from '../../lib/api'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  ImageUpload,
  Modal,
  MoveButtons,
  PageHeader,
  PageLoader,
  Toggle,
} from '../components/ui'
import { moveItem } from '../utils'

const TEXT_FIELDS = [
  'tagline',
  'heading',
  'description',
  'image_alt',
  'primary_btn_text',
  'primary_btn_link',
  'secondary_btn_text',
  'secondary_btn_link',
]

const emptySlide = {
  tagline: '',
  heading: '',
  description: '',
  image_alt: '',
  primary_btn_text: 'Book a Service',
  primary_btn_link: '#contact',
  secondary_btn_text: 'View Services',
  secondary_btn_link: '#services',
  is_active: true,
}

export default function SliderPage() {
  const toast = useToast()
  const [slides, setSlides] = useState(null)
  const [editing, setEditing] = useState(null)
  const [image, setImage] = useState({ file: null, removed: false })
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/hero/admin')
        .then((res) => setSlides(res.data.data))
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!slides) return <PageLoader />

  const openEditor = (slide) => {
    const base = slide ?? emptySlide
    setEditing({
      ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, base[k] ?? ''])),
      id: slide?.id,
      image_url: slide?.image_url,
      is_active: !!base.is_active,
    })
    setImage({ file: null, removed: false })
  }

  const set = (key) => (e) => setEditing({ ...editing, [key]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const data = toFormData({
        ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, editing[k]])),
        is_active: editing.is_active,
        image: image.file || undefined,
        remove_image: image.removed || undefined,
      })
      if (editing.id) await api.put(`/hero/${editing.id}`, data)
      else await api.post('/hero', data)
      toast(editing.id ? 'Slide updated' : 'Slide added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (s) => {
    setSlides((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/hero/${s.id}`, toFormData({ is_active: !s.is_active }))
      toast(s.is_active ? 'Slide hidden from website' : 'Slide is live again')
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(slides, index, step)
    setSlides(next)
    try {
      await api.put('/hero/reorder', { ids: next.map((s) => s.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/hero/${deleting.id}`)
      toast('Slide deleted')
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
        icon={Images}
        title="Hero Slider"
        subtitle="The big sliding banner visitors see first. Each slide has its own photo and words."
        action={
          <Button icon={Plus} onClick={() => openEditor(null)}>
            Add slide
          </Button>
        }
      />

      {slides.length === 0 ? (
        <Card>
          <EmptyState
            icon={Images}
            title="No slides yet"
            text="Add your first slide to welcome visitors."
            action={
              <Button icon={Plus} onClick={() => openEditor(null)}>
                Add slide
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="slides">
          {slides.map((s, i) => (
            <article key={s.id} className={`slide-card ${s.is_active ? '' : 'is-muted'}`}>
              <div className="slide-card__media">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.image_alt || ''} />
                ) : (
                  <button type="button" className="slide-card__noimg" onClick={() => openEditor(s)}>
                    <ImageOff size={26} />
                    <span>Add a photo</span>
                  </button>
                )}
                <span className="slide-card__num">Slide {i + 1}</span>
                <div className="slide-card__overlay">
                  <span className="slide-card__tag">{s.tagline}</span>
                  <h3>{s.heading}</h3>
                </div>
              </div>
              <div className="slide-card__bar">
                <MoveButtons index={i} total={slides.length} onMove={move} />
                <div className="switch-row switch-row--sm">
                  <Toggle checked={!!s.is_active} onChange={() => toggle(s)} label="Show on website" />
                  <span>{s.is_active ? 'Live' : 'Hidden'}</span>
                </div>
                <IconButton icon={Pencil} label="Edit slide" onClick={() => openEditor(s)} />
                <IconButton icon={Trash2} label="Delete slide" variant="danger" onClick={() => setDeleting(s)} />
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          wide
          title={editing.id ? 'Edit slide' : 'New slide'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="slide-form" icon={Save} loading={busy}>
                Save slide
              </Button>
            </>
          }
        >
          <form id="slide-form" className="grid-2 grid-2--modal" onSubmit={save}>
            <div>
              <ImageUpload
                label="Upload slide photo"
                value={editing.image_url}
                file={image.file}
                removed={image.removed}
                onPick={(file) => setImage({ file, removed: false })}
                onRemove={() => setImage({ file: null, removed: true })}
                hint="Wide landscape photo, at least 1920 × 1080 px."
              />
              <Field label="Photo description" hint="Helps Google and screen readers.">
                <input className="input" value={editing.image_alt} onChange={set('image_alt')} />
              </Field>
              <div className="switch-row">
                <Toggle
                  checked={editing.is_active}
                  onChange={(v) => setEditing({ ...editing, is_active: v })}
                  label="Show on website"
                />
                <span>Show on website</span>
              </div>
            </div>

            <div>
              <Field label="Small heading" hint="The gold line above the title, e.g. SAREE CARE">
                <input className="input" required value={editing.tagline} onChange={set('tagline')} />
              </Field>
              <Field label="Main heading">
                <input className="input" required value={editing.heading} onChange={set('heading')} />
              </Field>
              <Field label="Short description" count={editing.description.length} max={200}>
                <textarea
                  className="input"
                  rows={3}
                  required
                  value={editing.description}
                  onChange={set('description')}
                />
              </Field>
              <div className="row-2">
                <Field label="First button text">
                  <input className="input" value={editing.primary_btn_text} onChange={set('primary_btn_text')} />
                </Field>
                <Field label="Goes to">
                  <input className="input" value={editing.primary_btn_link} onChange={set('primary_btn_link')} />
                </Field>
              </div>
              <div className="row-2">
                <Field label="Second button text">
                  <input className="input" value={editing.secondary_btn_text} onChange={set('secondary_btn_text')} />
                </Field>
                <Field label="Goes to">
                  <input
                    className="input"
                    value={editing.secondary_btn_link}
                    onChange={set('secondary_btn_link')}
                  />
                </Field>
              </div>
              <p className="field__hint">Leave a button's text empty to hide that button.</p>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this slide?"
          message={`The "${deleting.tagline}" slide and its photo will be removed for good. Tip: switch it off instead to hide it.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
