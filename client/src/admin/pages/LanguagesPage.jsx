import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Languages, PenLine, Pencil, Plus, Save, Star, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  IconButton,
  Modal,
  MoveButtons,
  PageHeader,
  PageLoader,
  Toggle,
} from '../components/ui'
import { moveItem, percent } from '../utils'

const emptyLanguage = { code: '', name: '', native_name: '', is_active: true }

// Common picks so the admin doesn't have to know language codes
const PRESETS = [
  { code: 'ta', name: 'Tamil', native_name: 'தமிழ்' },
  { code: 'fr', name: 'French', native_name: 'Français' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ' },
]

export default function LanguagesPage() {
  const toast = useToast()
  const [languages, setLanguages] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      api
        .get('/languages/admin')
        .then((res) => setLanguages(res.data.data))
        .catch((err) => toast(errorMessage(err), 'error')),
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  if (!languages) return <PageLoader />

  const main = languages.find((l) => l.is_default)
  const unusedPresets = PRESETS.filter((p) => !languages.some((l) => l.code === p.code))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, code, name, native_name, is_active } = editing
      if (id) await api.put(`/languages/${id}`, { code, name, native_name, is_active })
      else await api.post('/languages', { code, name, native_name, is_active })
      toast(id ? `${name} updated` : `${name} added — now add its content`)
      setEditing(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (lang) => {
    setLanguages((list) => list.map((l) => (l.id === lang.id ? { ...l, is_active: !l.is_active } : l)))
    try {
      await api.put(`/languages/${lang.id}`, { is_active: !lang.is_active })
      toast(lang.is_active ? `${lang.name} hidden from the website` : `${lang.name} is showing on the website`)
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const move = async (index, step) => {
    const next = moveItem(languages, index, step)
    setLanguages(next)
    try {
      await api.put('/languages/reorder', { ids: next.map((l) => l.id) })
    } catch (err) {
      toast(errorMessage(err), 'error')
      load()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/languages/${deleting.id}`)
      toast(`${deleting.name} deleted`)
      setDeleting(null)
      load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const setField = (key) => (e) => setEditing({ ...editing, [key]: e.target.value })

  return (
    <>
      <PageHeader
        icon={Languages}
        title="Languages"
        subtitle="Show your website in Tamil, French and more. Visitors pick their language at the top of the site."
        action={
          <Button icon={Plus} onClick={() => setEditing({ ...emptyLanguage })}>
            Add language
          </Button>
        }
      />

      <Card
        title="Website languages"
        subtitle="The order here is the order in the website's language menu. Switch one off to hide it while you work on it."
      >
        <ul className="list">
          {languages.map((lang, i) => {
            const pct = lang.progress && percent(lang.progress)
            return (
              <li key={lang.id} className={`list-row lang-row ${lang.is_active ? '' : 'is-muted'}`}>
                <MoveButtons index={i} total={languages.length} onMove={move} />
                <span className="lang-code">{lang.code}</span>
                <div className="list-row__main">
                  <strong>
                    {lang.name}
                    {lang.native_name !== lang.name && <span className="lang-native"> · {lang.native_name}</span>}
                  </strong>
                  {lang.is_default ? (
                    <small>
                      <Star size={12} /> Main language · typed on the normal section pages
                    </small>
                  ) : (
                    <span className="lang-progress">
                      <span className="lang-progress__bar">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                      <small>
                        {lang.progress.done} of {lang.progress.total} texts · {pct}%
                      </small>
                    </span>
                  )}
                </div>
                {!lang.is_default && (
                  <Link to={`/admin/languages/${lang.code}`} className="btn btn--ghost btn--sm lang-row__edit">
                    <PenLine size={16} /> Add content
                  </Link>
                )}
                {lang.is_default ? (
                  <span className="lang-main-pill">Main</span>
                ) : (
                  <Toggle checked={!!lang.is_active} onChange={() => toggle(lang)} label="Show on website" />
                )}
                <IconButton
                  icon={Pencil}
                  label="Edit name"
                  onClick={() => setEditing({ ...lang, is_active: !!lang.is_active })}
                />
                {!lang.is_default && (
                  <IconButton icon={Trash2} label="Delete language" variant="danger" onClick={() => setDeleting(lang)} />
                )}
              </li>
            )
          })}
        </ul>
        <p className="note">
          <Info size={16} />
          <span>
            Any text you have not translated yet shows in {main?.name || 'the main language'}, so the website never has
            empty spots. When you change a text in {main?.name || 'the main language'} later, update its translations too.
          </span>
        </p>
      </Card>

      {editing && (
        <Modal
          title={editing.id ? `Edit ${editing.name}` : 'New language'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form="language-form" icon={Save} loading={busy}>
                Save language
              </Button>
            </>
          }
        >
          <form id="language-form" onSubmit={save}>
            {!editing.id && unusedPresets.length > 0 && (
              <>
                <span className="field__label">Quick pick</span>
                <div className="preset-row">
                  {unusedPresets.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      className={`preset ${editing.code === p.code ? 'is-active' : ''}`}
                      onClick={() => setEditing({ ...editing, ...p })}
                    >
                      {p.native_name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="row-2">
              <Field label="Name in English" hint="Shown to you in the admin panel.">
                <input className="input" required autoFocus value={editing.name} onChange={setField('name')} />
              </Field>
              <Field label="Name in its own language" hint="Shown to visitors, e.g. தமிழ்.">
                <input className="input" required value={editing.native_name} onChange={setField('native_name')} />
              </Field>
            </div>
            <Field label="Short code" hint="Two letters, e.g. ta for Tamil, fr for French.">
              <input
                className="input"
                required
                maxLength={10}
                pattern="[A-Za-z]{2,3}(-[A-Za-z0-9]{2,4})?"
                value={editing.code}
                onChange={setField('code')}
              />
            </Field>
            {!editing.is_default && (
              <div className="switch-row">
                <Toggle
                  checked={editing.is_active}
                  onChange={(v) => setEditing({ ...editing, is_active: v })}
                  label="Show on website"
                />
                <span>Show on website</span>
              </div>
            )}
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          message={`${deleting.name} and all ${deleting.progress?.done ?? 0} of its translated texts will be removed. Tip: switch it off instead to hide it for now.`}
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
