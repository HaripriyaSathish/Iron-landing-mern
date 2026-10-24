import { useCallback, useEffect, useState } from 'react'
import { Compass, Link2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage, toFormData } from '../../lib/api'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
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

const emptyLink = { label: '', target: '#', is_active: true }

export default function MenuPage() {
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [links, setLinks] = useState([])
  const [form, setForm] = useState(null)
  const [logo, setLogo] = useState({ file: null, removed: false })
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null) // link being added/edited
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/navbar/admin')
        .then((res) => {
          const s = res.data.data.settings
          setSettings(s)
          setForm({ logo_alt: s.logo_alt ?? '', cta_text: s.cta_text, cta_link: s.cta_link })
          setLogo({ file: null, removed: false })
          setLinks(res.data.data.links)
        })
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!form) return <PageLoader />

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put(
        '/navbar/settings',
        toFormData({ ...form, logo: logo.file || undefined, remove_logo: logo.removed || undefined }),
      )
      setSettings(res.data.data)
      setLogo({ file: null, removed: false })
      toast('Top bar saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveLink = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, label, target, is_active } = editing
      if (id) await api.put(`/navbar/links/${id}`, { label, target, is_active })
      else await api.post('/navbar/links', { label, target, is_active })
      toast(id ? 'Menu link updated' : 'Menu link added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggleLink = async (link) => {
    setLinks((list) => list.map((l) => (l.id === link.id ? { ...l, is_active: !l.is_active } : l)))
    try {
      await api.put(`/navbar/links/${link.id}`, { is_active: !link.is_active })
      toast(link.is_active ? `"${link.label}" hidden from menu` : `"${link.label}" is back in the menu`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(links, index, step)
    setLinks(next)
    try {
      await api.put('/navbar/links/reorder', { ids: next.map((l) => l.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/navbar/links/${deleting.id}`)
      toast('Menu link deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <>
      <PageHeader
        icon={Compass}
        title="Navbar & Menu"
        subtitle="The strip at the very top of your website: logo, menu links and the main button."
      />

      <div className="grid-2">
        <form onSubmit={saveSettings}>
          <Card title="Logo & main button">
            <ImageUpload
              label="Upload logo"
              value={settings.logo_url}
              file={logo.file}
              removed={logo.removed}
              onPick={(file) => setLogo({ file, removed: false })}
              onRemove={() => setLogo({ file: null, removed: true })}
              ratio="1 / 1"
              hint="Square or round logo, PNG with transparent background looks best."
            />
            <Field label="Logo description" hint="Read aloud by screen readers.">
              <input className="input" value={form.logo_alt} onChange={set('logo_alt')} />
            </Field>
            <div className="row-2">
              <Field label="Button text">
                <input className="input" required value={form.cta_text} onChange={set('cta_text')} />
              </Field>
              <Field label="Button goes to" hint="#contact scrolls to the Contact section.">
                <input className="input" required value={form.cta_link} onChange={set('cta_link')} />
              </Field>
            </div>
            <div className="card__foot">
              <span className="preview-pill">{form.cta_text || 'Button'}</span>
              <Button type="submit" icon={Save} loading={saving}>
                Save top bar
              </Button>
            </div>
          </Card>
        </form>

        <Card
          title="Menu links"
          subtitle="Use the arrows to reorder. Switch off to hide a link without deleting it."
        >
          <ul className="list">
            {links.map((link, i) => (
              <li key={link.id} className={`list-row ${link.is_active ? '' : 'is-muted'}`}>
                <MoveButtons index={i} total={links.length} onMove={move} />
                <div className="list-row__main">
                  <strong>{link.label}</strong>
                  <small>
                    <Link2 size={12} /> {link.target}
                  </small>
                </div>
                <Toggle checked={!!link.is_active} onChange={() => toggleLink(link)} label="Show in menu" />
                <IconButton icon={Pencil} label="Edit" onClick={() => setEditing({ ...link, is_active: !!link.is_active })} />
                <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setDeleting(link)} />
              </li>
            ))}
          </ul>
          <Button variant="ghost" icon={Plus} onClick={() => setEditing({ ...emptyLink })}>
            Add menu link
          </Button>
        </Card>
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Edit menu link' : 'New menu link'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="link-form" icon={Save} loading={busy}>
                Save link
              </Button>
            </>
          }
        >
          <form id="link-form" onSubmit={saveLink}>
            <Field label="Link text">
              <input
                className="input"
                required
                autoFocus
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </Field>
            <Field label="Goes to" hint="Section id like #services, or a full web address.">
              <input
                className="input"
                required
                value={editing.target}
                onChange={(e) => setEditing({ ...editing, target: e.target.value })}
              />
            </Field>
            <div className="switch-row">
              <Toggle
                checked={editing.is_active}
                onChange={(v) => setEditing({ ...editing, is_active: v })}
                label="Show in menu"
              />
              <span>Show in menu</span>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this menu link?"
          message={`"${deleting.label}" will be removed from the menu. Tip: switch it off instead if you may need it later.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
