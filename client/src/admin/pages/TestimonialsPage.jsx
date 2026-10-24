import { useCallback, useEffect, useState } from 'react'
import { MessageSquareQuote, Pencil, Plus, Save, Star, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
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

const emptyTestimonial = { quote: '', name: '', role: 'Verified customer', rating: 5, is_active: true }

function Stars({ rating, onChange }) {
  return (
    <div className={`stars ${onChange ? 'stars--input' : ''}`} role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={n <= rating ? 'is-on' : ''}
            onClick={() => onChange(n)}
          >
            <Star size={26} />
          </button>
        ) : (
          <Star key={n} size={16} className={n <= rating ? 'is-on' : ''} />
        ),
      )}
    </div>
  )
}

export default function TestimonialsPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/testimonials/admin')
        .then((res) => {
          const s = res.data.data.section
          setForm({ tagline: s.tagline ?? '', heading: s.heading ?? '' })
          setItems(res.data.data.testimonials)
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
      await api.put('/testimonials/section', form)
      toast('Section heading saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveItem = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, quote, name, role, rating, is_active } = editing
      const body = { quote, name, role, rating, is_active }
      if (id) await api.put(`/testimonials/${id}`, body)
      else await api.post('/testimonials', body)
      toast(id ? 'Review updated' : 'Review added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (t) => {
    setItems((list) => list.map((x) => (x.id === t.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/testimonials/${t.id}`, { is_active: !t.is_active })
      toast(t.is_active ? `${t.name}'s review hidden` : `${t.name}'s review is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(items, index, step)
    setItems(next)
    try {
      await api.put('/testimonials/reorder', { ids: next.map((t) => t.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/testimonials/${deleting.id}`)
      toast('Review deleted')
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
        icon={MessageSquareQuote}
        title="Testimonials"
        subtitle="Kind words from customers, with their star rating."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptyTestimonial })}>
            Add review
          </Button>
        }
      />

      <form onSubmit={saveSection}>
        <Card title="Section heading">
          <div className="row-2">
            <Field label="Small heading" hint="The gold line, e.g. TESTIMONIALS">
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
          Reviews <span className="count-pill">{items.length}</span>
        </h2>
        <span className="field__hint">The letter in the circle comes from the customer's name.</span>
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={MessageSquareQuote} title="No reviews yet" text="Add what your customers say about you." />
        </Card>
      ) : (
        <div className="review-grid">
          {items.map((t, i) => (
            <article key={t.id} className={`review-card ${t.is_active ? '' : 'is-muted'}`}>
              <Stars rating={t.rating} />
              <blockquote>“{t.quote}”</blockquote>
              <div className="review-card__who">
                <span className="review-card__avatar">{t.name.trim().charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </div>
              </div>
              <div className="slide-card__bar">
                <MoveButtons index={i} total={items.length} onMove={move} />
                <div className="switch-row switch-row--sm">
                  <Toggle checked={!!t.is_active} onChange={() => toggle(t)} label="Show on website" />
                  <span>{t.is_active ? 'Live' : 'Hidden'}</span>
                </div>
                <IconButton
                  icon={Pencil}
                  label="Edit review"
                  onClick={() => setEditing({ ...t, role: t.role ?? '', is_active: !!t.is_active })}
                />
                <IconButton icon={Trash2} label="Delete review" variant="danger" onClick={() => setDeleting(t)} />
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Edit review' : 'New review'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="review-form" icon={Save} loading={busy}>
                Save review
              </Button>
            </>
          }
        >
          <form id="review-form" onSubmit={saveItem}>
            <span className="field__label">Star rating</span>
            <Stars rating={editing.rating} onChange={(rating) => setEditing({ ...editing, rating })} />
            <Field label="What they said" count={editing.quote.length} max={160} hint="No need to type the quote marks.">
              <textarea className="input" rows={4} required autoFocus value={editing.quote} onChange={setField('quote')} />
            </Field>
            <div className="row-2">
              <Field label="Customer name" hint="e.g. Lakshmi R.">
                <input className="input" required value={editing.name} onChange={setField('name')} />
              </Field>
              <Field label="Line under the name">
                <input className="input" value={editing.role} onChange={setField('role')} />
              </Field>
            </div>
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
          title="Delete this review?"
          message={`${deleting.name}'s review will be removed for good. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
