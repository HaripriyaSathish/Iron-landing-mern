import { useCallback, useEffect, useState } from 'react'
import { ChevronsRight, Pencil, Plus, Save, Trash2 } from 'lucide-react'
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

const emptyItem = { icon: 'Truck', text: '', is_active: true }

export default function TickerPage() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/ticker/admin')
        .then((res) => setItems(res.data.data))
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!items) return <PageLoader />

  const saveItem = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, icon, text, is_active } = editing
      if (id) await api.put(`/ticker/items/${id}`, { icon, text, is_active })
      else await api.post('/ticker/items', { icon, text, is_active })
      toast(id ? 'Line updated' : 'Line added')
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (item) => {
    setItems((list) => list.map((x) => (x.id === item.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await api.put(`/ticker/items/${item.id}`, { is_active: !item.is_active })
      toast(item.is_active ? `"${item.text}" hidden` : `"${item.text}" is showing again`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(items, index, step)
    setItems(next)
    try {
      await api.put('/ticker/items/reorder', { ids: next.map((x) => x.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/ticker/items/${deleting.id}`)
      toast('Line deleted')
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
        icon={ChevronsRight}
        title="Moving Offer Line"
        subtitle="The gold band that scrolls sideways under the hero: free pickup, courier service and other offers."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptyItem })}>
            Add line
          </Button>
        }
      />

      <Card
        title="Your lines"
        subtitle="They scroll in this order and repeat. Short lines read best. Visitors can point at the band to pause it."
      >
        {items.length === 0 ? (
          <EmptyState icon={ChevronsRight} title="No lines yet" text="Add a line such as Courier service available." />
        ) : (
          <ul className="list">
            {items.map((item, i) => {
              const Icon = getIcon(item.icon)
              return (
                <li key={item.id} className={`list-row ${item.is_active ? '' : 'is-muted'}`}>
                  <MoveButtons index={i} total={items.length} onMove={move} />
                  <span className="social-dot">
                    <Icon size={18} />
                  </span>
                  <div className="list-row__main">
                    <strong>{item.text}</strong>
                  </div>
                  <Toggle checked={!!item.is_active} onChange={() => toggle(item)} label="Show on website" />
                  <IconButton icon={Pencil} label="Edit" onClick={() => setEditing({ ...item, is_active: !!item.is_active })} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setDeleting(item)} />
                </li>
              )
            })}
          </ul>
        )}
        <Button variant="ghost" icon={Plus} onClick={() => setEditing({ ...emptyItem })}>
          Add line
        </Button>
      </Card>

      {editing && (
        <Modal
          title={editing.id ? 'Edit line' : 'New line'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="ticker-form" icon={Save} loading={busy}>
                Save line
              </Button>
            </>
          }
        >
          <form id="ticker-form" onSubmit={saveItem}>
            <Field label="Text" hint="e.g. **Courier service** available. Words between ** ** glow in a maroon pill." count={editing.text.length} max={160}>
              <input
                className="input"
                required
                autoFocus
                maxLength={160}
                value={editing.text}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
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
          title="Delete this line?"
          message={`"${deleting.text}" will be removed from the moving band. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
