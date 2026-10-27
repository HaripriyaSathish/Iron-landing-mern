import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PanelBottom, Save } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader, PageLoader } from '../components/ui'

const FIELDS = ['about_text', 'links_title', 'services_title', 'services_limit', 'contact_title', 'hours_short', 'copyright_text']

// Parts of the footer that come from other pages, so they are edited in one place
const REUSED = [
  { what: 'Logo', where: 'Navbar & Menu', path: '/admin/menu' },
  { what: 'Quick links', where: 'Navbar & Menu', path: '/admin/menu' },
  { what: 'Services list', where: 'Services & Prices', path: '/admin/services' },
  { what: 'Phone, email & address', where: 'Contact & Booking', path: '/admin/contact' },
]

export default function FooterPage() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/footer/admin')
      .then((res) => {
        const s = res.data.data.settings
        setForm(Object.fromEntries(FIELDS.map((k) => [k, s[k] ?? ''])))
      })
      .catch((err) => toast(errorMessage(err), 'error'))
  }, [toast])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/footer/settings', form)
      toast('Footer saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <>
      <PageHeader
        icon={PanelBottom}
        title="Footer"
        subtitle="The dark strip at the bottom of every page: your short intro, link columns and copyright line."
      />

      <div className="grid-2 grid-2--wide-left">
        <form onSubmit={saveSettings}>
          <Card title="Footer words">
            <Field label="Short intro under the logo" count={form.about_text.length} max={160}>
              <textarea className="input" rows={3} value={form.about_text} onChange={set('about_text')} />
            </Field>
            <div className="row-3">
              <Field label="Links column title">
                <input className="input" required value={form.links_title} onChange={set('links_title')} />
              </Field>
              <Field label="Services column title">
                <input className="input" required value={form.services_title} onChange={set('services_title')} />
              </Field>
              <Field label="Contact column title">
                <input className="input" required value={form.contact_title} onChange={set('contact_title')} />
              </Field>
            </div>
            <div className="row-2">
              <Field label="How many services to list" hint="Taken from the top of Services & Prices.">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.services_limit}
                  onChange={set('services_limit')}
                />
              </Field>
              <Field label="Short opening hours" hint="A shorter version for the footer.">
                <input className="input" value={form.hours_short} onChange={set('hours_short')} />
              </Field>
            </div>
            <Field label="Copyright line" hint={`Type {year} for the current year. Shows as: ${form.copyright_text.replaceAll('{year}', year)}`}>
              <input className="input" required value={form.copyright_text} onChange={set('copyright_text')} />
            </Field>
            <div className="card__foot">
              <span />
              <Button type="submit" icon={Save} loading={saving}>
                Save footer
              </Button>
            </div>
          </Card>
        </form>

        <div className="stack">
          <Card title="Filled in for you" subtitle="These parts update automatically from other pages.">
            <ul className="reused">
              {REUSED.map(({ what, where, path }) => (
                <li key={what}>
                  <span>{what}</span>
                  <Link to={path}>
                    {where} <ArrowRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
