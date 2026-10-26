import { useCallback, useEffect, useState } from 'react'
import { Mail, MessageCircle, MessageCircleHeart, Pencil, Phone, Plus, Save, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { contactHref, isLink } from '../../lib/contacts'
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

const CONTACT_TYPES = {
  call: { icon: Phone, name: 'Phone call', valueLabel: 'Phone number', placeholder: '+91 82206 95123' },
  whatsapp: { icon: MessageCircle, name: 'WhatsApp', valueLabel: 'WhatsApp number or link', placeholder: '918220695123' },
  email: { icon: Mail, name: 'Email', valueLabel: 'Email address', placeholder: 'ironmeka605@gmail.com' },
}

const emptyContact = { type: 'call', label: '', value: '', message: '', is_active: true }

export default function QuickConnectPage() {
  const toast = useToast()
  const [contacts, setContacts] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/quick-contacts/admin')
        .then((res) => setContacts(res.data.data))
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!contacts) return <PageLoader />

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, type, label, value, message, is_active } = editing
      const body = { type, label, value, message: type === 'whatsapp' ? message || null : null, is_active }
      if (id) await api.put(`/quick-contacts/${id}`, body)
      else await api.post('/quick-contacts', body)
      toast(id ? 'Button updated' : 'Button added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (c) => {
    setContacts((list) => list.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/quick-contacts/${c.id}`, { is_active: !c.is_active })
      toast(c.is_active ? `${c.label} hidden` : `${c.label} is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(contacts, index, step)
    setContacts(next)
    try {
      await api.put('/quick-contacts/reorder', { ids: next.map((c) => c.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/quick-contacts/${deleting.id}`)
      toast('Button deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const type = editing && CONTACT_TYPES[editing.type]

  return (
    <>
      <PageHeader
        icon={MessageCircleHeart}
        title="Floating Buttons"
        subtitle="The round floating buttons at the side of your website, so customers can reach you in one tap."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptyContact })}>
            Add button
          </Button>
        }
      />

      <div className="grid-2 grid-2--wide-left">
        <Card title="Your buttons" subtitle="Top of the list shows first.">
          {contacts.length === 0 ? (
            <EmptyState
              icon={MessageCircleHeart}
              title="No buttons yet"
              text="Add a call, WhatsApp or email button."
            />
          ) : (
            <ul className="list">
              {contacts.map((c, i) => {
                const Icon = CONTACT_TYPES[c.type].icon
                return (
                  <li key={c.id} className={`list-row ${c.is_active ? '' : 'is-muted'}`}>
                    <MoveButtons index={i} total={contacts.length} onMove={move} />
                    <span className={`contact-dot contact-dot--${c.type}`}>
                      <Icon size={18} />
                    </span>
                    <div className="list-row__main">
                      <strong>{c.label}</strong>
                      <small>{c.value}</small>
                    </div>
                    <Toggle checked={!!c.is_active} onChange={() => toggle(c)} label="Show on website" />
                    <IconButton
                      icon={Pencil}
                      label="Edit"
                      onClick={() => setEditing({ ...c, message: c.message ?? '', is_active: !!c.is_active })}
                    />
                    <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setDeleting(c)} />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title="Live preview" subtitle="How the buttons float on the page.">
          <div className="float-preview">
            <div className="float-preview__page" />
            <div className="float-preview__stack">
              {contacts
                .filter((c) => c.is_active)
                .map((c) => {
                  const Icon = CONTACT_TYPES[c.type].icon
                  return (
                    <a
                      key={c.id}
                      href={contactHref(c)}
                      target="_blank"
                      rel="noreferrer"
                      className={`contact-dot contact-dot--${c.type} contact-dot--lg`}
                      title={`Test: ${c.label}`}
                    >
                      <Icon size={22} />
                    </a>
                  )
                })}
            </div>
          </div>
          <p className="field__hint">Tap a preview button to test it.</p>
        </Card>
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Edit button' : 'New button'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="contact-form" icon={Save} loading={busy}>
                Save button
              </Button>
            </>
          }
        >
          <form id="contact-form" onSubmit={save}>
            <div className="type-picker">
              {Object.entries(CONTACT_TYPES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  className={`type-picker__opt ${editing.type === key ? 'is-active' : ''}`}
                  onClick={() => setEditing({ ...editing, type: key })}
                >
                  <t.icon size={20} />
                  {t.name}
                </button>
              ))}
            </div>
            <Field label="Button name" hint="Shown when visitors hover the button.">
              <input
                className="input"
                required
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </Field>
            <Field
              label={type.valueLabel}
              hint={
                editing.type === 'whatsapp'
                  ? 'Country code + number, no spaces (91 for India), or your WhatsApp Business link (https://wa.me/message/…).'
                  : undefined
              }
            >
              <input
                className="input"
                required
                placeholder={type.placeholder}
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              />
            </Field>
            {/* Business links (wa.me/message/…) bring their own message, so this only applies to numbers */}
            {editing.type === 'whatsapp' && !isLink(editing.value) && (
              <Field label="Ready-made message (optional)" hint="Pre-filled in the customer's WhatsApp chat.">
                <textarea
                  className="input"
                  rows={2}
                  value={editing.message}
                  onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                />
              </Field>
            )}
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
          title="Delete this button?"
          message={`"${deleting.label}" will be removed from your website.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
