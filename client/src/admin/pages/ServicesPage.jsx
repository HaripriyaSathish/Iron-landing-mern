import { useCallback, useEffect, useState } from 'react'
import { ImageOff, Pencil, Plus, Save, Shirt, Trash2 } from 'lucide-react'
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

const SECTION_FIELDS = ['tagline', 'heading', 'subheading', 'price_label', 'btn_text', 'btn_link']
const emptyService = { title: '', description: '', price: '', image_alt: '', is_active: true }

const formatPrice = (price) => (price === null || price === '' ? null : `₹${Number(price).toLocaleString('en-IN')}`)
const cardNumber = (i) => String(i + 1).padStart(2, '0')

export default function ServicesPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [services, setServices] = useState([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [image, setImage] = useState({ file: null, removed: false })
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/services/admin')
        .then((res) => {
          const s = res.data.data.section
          setForm(Object.fromEntries(SECTION_FIELDS.map((k) => [k, s[k] ?? ''])))
          setServices(res.data.data.services)
        })
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const setField = (key) => (e) => setEditing({ ...editing, [key]: e.target.value })

  const saveSection = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/services/section', form)
      toast('Section heading saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEditor = (service) => {
    setEditing(
      service
        ? {
            id: service.id,
            title: service.title,
            description: service.description,
            price: service.price ?? '',
            image_alt: service.image_alt ?? '',
            image_url: service.image_url,
            is_active: !!service.is_active,
          }
        : { ...emptyService },
    )
    setImage({ file: null, removed: false })
  }

  const saveService = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, title, description, price, image_alt, is_active } = editing
      const data = toFormData({
        title,
        description,
        price,
        image_alt,
        is_active,
        image: image.file || undefined,
        remove_image: image.removed || undefined,
      })
      if (id) await api.put(`/services/${id}`, data)
      else await api.post('/services', data)
      toast(id ? 'Service updated' : 'Service added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (s) => {
    setServices((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/services/${s.id}`, toFormData({ is_active: !s.is_active }))
      toast(s.is_active ? `"${s.title}" hidden from website` : `"${s.title}" is live again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(services, index, step)
    setServices(next)
    try {
      await api.put('/services/reorder', { ids: next.map((s) => s.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/services/${deleting.id}`)
      toast('Service deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const missingPhotos = services.filter((s) => !s.image_url).length

  return (
    <>
      <PageHeader
        icon={Shirt}
        title="Services & Prices"
        subtitle="Every service card on your website: photo, name, short description and starting price."
        action={
          <Button icon={Plus} onClick={() => openEditor(null)}>
            Add service
          </Button>
        }
      />

      <form onSubmit={saveSection}>
        <Card title="Section heading" subtitle="The words above the service cards.">
          <div className="row-2">
            <Field label="Small heading" hint="The gold line, e.g. WHAT WE DO">
              <input className="input" required value={form.tagline} onChange={set('tagline')} />
            </Field>
            <Field label="Main heading">
              <input className="input" required value={form.heading} onChange={set('heading')} />
            </Field>
          </div>
          <Field label="Short line under the heading">
            <input className="input" value={form.subheading} onChange={set('subheading')} />
          </Field>
          <div className="row-3">
            <Field label="Price label" hint="Shown above each price">
              <input className="input" value={form.price_label} onChange={set('price_label')} />
            </Field>
            <Field label="Card button text">
              <input className="input" value={form.btn_text} onChange={set('btn_text')} />
            </Field>
            <Field label="Button goes to" hint="#contact opens the booking form">
              <input className="input" value={form.btn_link} onChange={set('btn_link')} />
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
          Your services <span className="count-pill">{services.length}</span>
        </h2>
        {missingPhotos > 0 && (
          <span className="tile__stat is-warn">
            <ImageOff size={14} /> {missingPhotos} need a photo
          </span>
        )}
      </div>

      {services.length === 0 ? (
        <Card>
          <EmptyState
            icon={Shirt}
            title="No services yet"
            text="Add the services you offer with their starting price."
            action={
              <Button icon={Plus} onClick={() => openEditor(null)}>
                Add service
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="service-grid">
          {services.map((s, i) => (
            <article key={s.id} className={`service-card ${s.is_active ? '' : 'is-muted'}`}>
              <div className="service-card__media">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.image_alt || ''} />
                ) : (
                  <button type="button" className="slide-card__noimg" onClick={() => openEditor(s)}>
                    <ImageOff size={22} />
                    <span>Add a photo</span>
                  </button>
                )}
                <span className="service-card__num">{cardNumber(i)}</span>
              </div>
              <div className="service-card__body">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="service-card__price">
                  <small>{form.price_label}</small>
                  <strong>{formatPrice(s.price) ?? 'No price shown'}</strong>
                </div>
              </div>
              <div className="slide-card__bar">
                <MoveButtons index={i} total={services.length} onMove={move} />
                <div className="switch-row switch-row--sm">
                  <Toggle checked={!!s.is_active} onChange={() => toggle(s)} label="Show on website" />
                  <span>{s.is_active ? 'Live' : 'Hidden'}</span>
                </div>
                <IconButton icon={Pencil} label="Edit service" onClick={() => openEditor(s)} />
                <IconButton icon={Trash2} label="Delete service" variant="danger" onClick={() => setDeleting(s)} />
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          wide
          title={editing.id ? 'Edit service' : 'New service'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="service-form" icon={Save} loading={busy}>
                Save service
              </Button>
            </>
          }
        >
          <form id="service-form" className="grid-2 grid-2--modal" onSubmit={saveService}>
            <div>
              <ImageUpload
                label="Upload service photo"
                value={editing.image_url}
                file={image.file}
                removed={image.removed}
                onPick={(file) => setImage({ file, removed: false })}
                onRemove={() => setImage({ file: null, removed: true })}
                ratio="4 / 3"
                hint="Landscape photo, at least 800 × 600 px."
              />
              <Field label="Photo description" hint="Helps Google and screen readers.">
                <input className="input" value={editing.image_alt} onChange={setField('image_alt')} />
              </Field>
            </div>
            <div>
              <Field label="Service name">
                <input className="input" required autoFocus value={editing.title} onChange={setField('title')} />
              </Field>
              <Field label="Short description" count={editing.description.length} max={120}>
                <textarea
                  className="input"
                  rows={3}
                  required
                  value={editing.description}
                  onChange={setField('description')}
                />
              </Field>
              <Field label="Starting price (₹)" hint="Whole rupees. Leave empty to hide the price.">
                <div className="input-prefix">
                  <span>₹</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={editing.price}
                    onChange={setField('price')}
                  />
                </div>
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
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this service?"
          message={`"${deleting.title}" and its photo will be removed for good. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
