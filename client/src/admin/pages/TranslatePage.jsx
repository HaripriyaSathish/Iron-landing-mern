import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, EyeOff, Languages, Save } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { useToast } from '../components/Toast'
import { Button, Card, PageHeader, PageLoader, Toggle } from '../components/ui'
import { percent } from '../utils'

const itemKey = (i) => `${i.entity}:${i.entity_id}:${i.field}`

// Jump-link target for each section
const groupAnchor = (id) => `tr-${id}`

export default function TranslatePage() {
  const { code } = useParams()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [languages, setLanguages] = useState([])
  const [drafts, setDrafts] = useState({}) // itemKey → typed text not saved yet
  const [missingOnly, setMissingOnly] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    () =>
      api
        .get(`/languages/${code}/translations`)
        .then((res) => {
          setData(res.data.data)
          setDrafts({})
        })
        .catch((err) => toast(errorMessage(err), 'error')),
    [code, toast],
  )

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    api
      .get('/languages/admin')
      .then((res) => setLanguages(res.data.data.filter((l) => !l.is_default)))
      .catch(() => {})
  }, [])

  const changed = Object.keys(drafts).length

  // Typed but unsaved work is lost on reload/close, so the browser asks first
  useEffect(() => {
    if (!changed) return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [changed])

  const groups = useMemo(() => {
    if (!data) return []
    return data.groups.map((g) => {
      const items = g.blocks.flatMap((b) => b.items)
      return { ...g, done: items.filter((i) => i.value).length, total: items.length }
    })
  }, [data])

  // Also covers switching to another language's tab while its texts load
  if (!data || data.language.code !== code) return <PageLoader />

  const { language, progress } = data
  const valueOf = (item) => drafts[itemKey(item)] ?? item.value

  const setValue = (item, text) =>
    setDrafts((d) => {
      const next = { ...d }
      if (text === item.value) delete next[itemKey(item)]
      else next[itemKey(item)] = text
      return next
    })

  const save = async () => {
    setSaving(true)
    try {
      const all = data.groups.flatMap((g) => g.blocks.flatMap((b) => b.items))
      const items = all
        .filter((i) => itemKey(i) in drafts)
        .map(({ entity, entity_id, field }) => ({ entity, entity_id, field, value: drafts[`${entity}:${entity_id}:${field}`] }))
      const res = await api.put(`/languages/${code}/translations`, { items })
      setData(res.data.data)
      setDrafts({})
      toast(`${language.name} content saved`)
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  // "Only missing" keeps a row visible while it is being typed into, so it doesn't vanish mid-word
  // In-app links don't trigger the browser's leave warning, so ask before dropping typed text
  const confirmLeave = (e) => {
    if (changed && !window.confirm('You have unsaved changes. Leave without saving?')) e.preventDefault()
  }

  const isShown = (item) => !missingOnly || !item.value || itemKey(item) in drafts
  const pct = percent(progress)

  return (
    <>
      <PageHeader
        icon={Languages}
        title={`${language.name} content`}
        subtitle={`Type the ${language.name} version next to each English text. Leave a box empty to keep showing the English text.`}
        action={
          <Link to="/admin/languages" className="btn btn--ghost" onClick={confirmLeave}>
            <ArrowLeft size={18} /> All languages
          </Link>
        }
      />

      {languages.length > 1 && (
        <div className="preset-row">
          {languages.map((l) => (
            <Link key={l.code} to={`/admin/languages/${l.code}`} className={`preset ${l.code === code ? 'is-active' : ''}`}
              onClick={confirmLeave}
            >
              {l.native_name}
            </Link>
          ))}
        </div>
      )}

      <Card className="tr-summary">
        <div className="tr-summary__top">
          <div>
            <strong>
              {progress.done} of {progress.total} texts in {language.native_name}
            </strong>
            <span className="lang-progress__bar lang-progress__bar--lg">
              <span style={{ width: `${pct}%` }} />
            </span>
          </div>
          <span className="tr-summary__pct">{pct}%</span>
        </div>
        {!language.is_active && (
          <p className="status-box">
            <EyeOff size={16} /> {language.name} is switched off, so visitors don't see it yet. Switch it on from the
            Languages page when you are ready.
          </p>
        )}
        <div className="tr-summary__bar">
          <div className="tr-jump">
            {groups.map((g) => (
              <a key={g.id} href={`#${groupAnchor(g.id)}`} className={`tr-jump__link ${g.done === g.total ? 'is-done' : ''}`}>
                {g.done === g.total && <Check size={13} />}
                {g.title}
                <small>
                  {g.done}/{g.total}
                </small>
              </a>
            ))}
          </div>
          <label className="switch-row switch-row--sm">
            <Toggle checked={missingOnly} onChange={setMissingOnly} label="Only show texts still in English" />
            Only show texts still in English
          </label>
        </div>
      </Card>

      {groups.map((group) => {
        const blocks = group.blocks
          .map((b) => ({ ...b, items: b.items.filter(isShown) }))
          .filter((b) => b.items.length)
        if (!blocks.length) return null
        return (
          <section key={group.id} id={groupAnchor(group.id)} className="tr-group">
            <div className="section-bar">
              <h2>
                {group.title}
                <span className="count-pill">
                  {group.done}/{group.total}
                </span>
              </h2>
            </div>
            <Card>
              {blocks.map((block) => (
                <div key={block.key} className="tr-block">
                  {block.title && (
                    <h3 className="tr-block__title">
                      {block.title}
                      {block.hidden && <span className="tr-block__hidden">Hidden on website</span>}
                    </h3>
                  )}
                  {block.items.map((item) => {
                    const key = itemKey(item)
                    const value = valueOf(item)
                    const Input = item.multiline ? 'textarea' : 'input'
                    return (
                      <div key={key} className={`tr-row ${key in drafts ? 'is-changed' : ''}`}>
                        <div className="tr-row__source">
                          <span className="field__label">{item.label}</span>
                          <p lang="en">{item.source}</p>
                        </div>
                        <label className="tr-row__target">
                          <span className="field__label">
                            {language.name}
                            {item.value && !(key in drafts) && <Check size={15} className="tr-row__ok" />}
                          </span>
                          <Input
                            className="input"
                            lang={language.code}
                            rows={item.multiline ? Math.min(8, Math.max(2, Math.ceil(item.source.length / 60))) : undefined}
                            placeholder={`Type in ${language.name}… (empty shows the English text)`}
                            value={value}
                            onChange={(e) => setValue(item, e.target.value)}
                          />
                        </label>
                      </div>
                    )
                  })}
                </div>
              ))}
            </Card>
          </section>
        )
      })}

      {missingOnly && progress.done === progress.total && !changed && (
        <Card>
          <p className="status-box is-ok">
            <Check size={16} /> Every text on your website has a {language.name} version.
          </p>
        </Card>
      )}

      <div className={`tr-save ${changed ? 'is-dirty' : ''}`}>
        <span>{changed ? `${changed} unsaved ${changed === 1 ? 'change' : 'changes'}` : 'All changes saved'}</span>
        <Button icon={Save} loading={saving} disabled={!changed} onClick={save}>
          Save {language.name}
        </Button>
      </div>
    </>
  )
}
