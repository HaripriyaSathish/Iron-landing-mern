import { useCallback, useEffect, useState } from 'react'
import { CircleCheck, Gem, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage, toFormData } from '../../lib/api'
import { useToast } from '../components/Toast'
import {
  Button,
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

const emptyBlock = { tagline: '', title: '', intro: '', points: '', image_alt: '', is_active: true }

const lines = (text) => String(text ?? '').split(/\r?\n/).filter((l) => l.trim())
const pointTerm = (line) => line.match(/^(.{2,90}?)\s*:\s+/)?.[1]

export default function SpecialtiesPage() {
  const toast = useToast()
  const [blocks, setBlocks] = useState(null)
  const [editing, setEditing] = useState(null)
  const [image, setImage] = useState({ file: null, removed: false })
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/specialties/admin')
        .then((res) => setBlocks(res.data.data))
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!blocks) return <PageLoader />

  const open = (block) => {
    setImage({ file: null, removed: false })
    setEditing(
      block
        ? { ...emptyBlock, ...Object.fromEntries(Object.entries(block).map(([k, v]) => [k, v ?? ''])), is_active: !!block.is_active }
        : { ...emptyBlock },
    )
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, tagline, title, intro, points, image_alt, is_active } = editing
      const body = toFormData({
        tagline,
        title,
        intro,
        points,
        image_alt,
        is_active,
        image: image.file || undefined,
        remove_image: image.removed || undefined,
      })
      if (id) await api.put(`/specialties/${id}`, body)
      else await api.post('/specialties', body)
      toast(id ? 'Block updated' : 'Block added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (b) => {
    setBlocks((list) => list.map((x) => (x.id === b.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/specialties/${b.id}`, toFormData({ is_active: !b.is_active }))
      toast(b.is_active ? `"${b.title}" hidden` : `"${b.title}" is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(blocks, index, step)
    setBlocks(next)
    try {
      await api.put('/specialties/reorder', { ids: next.map((b) => b.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/specialties/${deleting.id}`)
      toast('Block deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const set = (key) => (e) => setEditing({ ...editing, [key]: e.target.value })

  return (
    <>
      <PageHeader
        icon={Gem}
        title="Specialties & B2B"
        subtitle="Your signature offers, like Premium Saree Polish and the service for hotels and Airbnbs. Shown after Services."
        action={
          <Button icon={Plus} onClick={() => open(null)}>
            Add block
          </Button>
        }
      />

      {blocks.length === 0 ? (
        <EmptyState icon={Gem} title="No blocks yet" text="Add your first specialty, e.g. Premium Saree Polish." />
      ) : (
        <div className="spec-admin">
          {blocks.map((b, i) => (
            <article key={b.id} className={`spec-card ${b.is_active ? '' : 'is-muted'}`}>
              {b.image_url && <img className="spec-card__img" src={b.image_url} alt="" />}
              <div className="spec-card__body">
                {b.tagline && <span className="spec-card__tag">{b.tagline}</span>}
                <h3>{b.title}</h3>
                {b.intro && <p>{b.intro.replaceAll('**', '')}</p>}
                <ul>
                  {lines(b.points).map((l, n) => (
                    <li key={n}>
                      <CircleCheck size={15} />
                      {pointTerm(l) || l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="spec-card__bar">
                <MoveButtons index={i} total={blocks.length} onMove={move} />
                <Toggle checked={!!b.is_active} onChange={() => toggle(b)} label="Show on website" />
                <IconButton icon={Pencil} label="Edit block" onClick={() => open(b)} />
                <IconButton icon={Trash2} label="Delete block" variant="danger" onClick={() => setDeleting(b)} />
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          wide
          title={editing.id ? 'Edit block' : 'New block'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="spec-form" icon={Save} loading={busy}>
                Save block
              </Button>
            </>
          }
        >
          <form id="spec-form" onSubmit={save} className="grid-2 grid-2--modal">
            <div>
              <ImageUpload
                label="Upload photo (optional)"
                value={editing.image_url}
                file={image.file}
                removed={image.removed}
                onPick={(file) => setImage({ file, removed: false })}
                onRemove={() => setImage({ file: null, removed: true })}
                ratio="4 / 3"
                hint="Without a photo, the text and points sit side by side."
              />
              <Field label="Photo description" hint="Read aloud by screen readers.">
                <input className="input" value={editing.image_alt} onChange={set('image_alt')} />
              </Field>
              <div className="switch-row">
                <Toggle checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} label="Show on website" />
                <span>Show on website</span>
              </div>
            </div>
            <div>
              <Field label="Small heading" hint="The gold line, e.g. OUR SPECIALTY">
                <input className="input" maxLength={80} value={editing.tagline} onChange={set('tagline')} />
              </Field>
              <Field label="Main heading">
                <input className="input" required autoFocus maxLength={200} value={editing.title} onChange={set('title')} />
              </Field>
              <Field label="Introduction" hint="Leave an empty line between paragraphs. Wrap words in **double stars** to highlight them in bold.">
                <textarea className="input" rows={5} value={editing.intro} onChange={set('intro')} />
              </Field>
              <Field
                label="Points"
                hint={'One per line. Text before the first ":" shows in bold, e.g. "Silk Saree Polish: A gentle…"'}
              >
                <textarea className="input" rows={6} value={editing.points} onChange={set('points')} />
              </Field>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this block?"
          message={`"${deleting.title}" will be removed from your website. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
