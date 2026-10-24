import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Info, MailCheck, Save, Send } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader, PageLoader, Toggle } from '../components/ui'

// One-click server settings for common providers
const PRESETS = [
  { name: 'Gmail', host: 'smtp.gmail.com', port: 587, hint: 'Email address = your Gmail address. App password = the 16-letter code from myaccount.google.com/apppasswords (turn on 2-Step Verification first). Do not use your normal Gmail password.' },
  { name: 'Brevo', host: 'smtp-relay.brevo.com', port: 2525, hint: 'Login and password are shown in Brevo under SMTP & API. Port 2525 also works on Render’s free plan.' },
  { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, hint: 'Email address = your Outlook address. App password = your Outlook password or app password.' },
]

const FIELDS = ['smtp_host', 'smtp_port', 'smtp_user', 'from_email', 'from_name', 'alert_email']

export default function EmailPage() {
  const toast = useToast()
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [hint, setHint] = useState(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const apply = (data) => {
    setSaved(data)
    setForm({ ...Object.fromEntries(FIELDS.map((k) => [k, data[k] ?? ''])), enabled: data.enabled })
    setPassword('')
  }

  useEffect(() => {
    api
      .get('/mail-settings')
      .then((res) => apply(res.data.data))
      .catch((err) => toast(errorMessage(err), 'error'))
  }, [toast])

  if (!form) return <PageLoader />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/mail-settings', { ...form, smtp_pass: password || undefined })
      apply(res.data.data)
      toast('Email settings saved')
      return true
    } catch (err) {
      toast(errorMessage(err), 'error')
      // The server may have saved the details but kept alerts off; reload to show the real state
      api.get('/mail-settings').then((res) => apply(res.data.data)).catch(() => {})
      return false
    } finally {
      setSaving(false)
    }
  }

  // Saves first so the test uses exactly what is on screen
  const sendTest = async () => {
    setTesting(true)
    try {
      await api.put('/mail-settings', { ...form, enabled: false, smtp_pass: password || undefined })
      const res = await api.post('/mail-settings/test')
      // Restore the on/off choice that was on screen
      const back = await api.put('/mail-settings', { enabled: form.enabled })
      apply(back.data.data)
      toast(res.data.message)
    } catch (err) {
      toast(errorMessage(err), 'error')
      api.get('/mail-settings').then((res) => apply(res.data.data)).catch(() => {})
    } finally {
      setTesting(false)
    }
  }

  const ready = saved.missing.length === 0

  return (
    <form onSubmit={save}>
      <PageHeader
        icon={MailCheck}
        title="Email Alerts"
        subtitle="Get an email whenever the admin password is changed. Below, enter the email account that should send these alerts."
        action={
          <Button type="submit" icon={Save} loading={saving}>
            Save settings
          </Button>
        }
      />

      <div className="grid-2 grid-2--stretch">
        <div className="stack">
          <Card title="Email account that sends the alerts" subtitle="Choose your email provider, then type that email account's login details.">
            <div className="preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className={`preset ${form.smtp_host === p.host ? 'is-active' : ''}`}
                  onClick={() => {
                    setForm({ ...form, smtp_host: p.host, smtp_port: p.port })
                    setHint(p.hint)
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {hint && (
              <p className="note">
                <Info size={16} /> {hint}
              </p>
            )}
            <div className="row-2 row-2--server">
              <Field label="Mail server address">
                <input className="input" value={form.smtp_host} onChange={set('smtp_host')} placeholder="smtp.gmail.com" />
              </Field>
              <Field label="Port number" hint="2525 on Render free">
                <input className="input" inputMode="numeric" value={form.smtp_port} onChange={set('smtp_port')} />
              </Field>
            </div>
            <Field label="Email address (login)" hint="The email account that sends the alerts, e.g. yourname@gmail.com">
              <input className="input" autoComplete="off" value={form.smtp_user} onChange={set('smtp_user')} />
            </Field>
            <Field
              label="Email app password"
              hint={
                saved.has_password
                  ? 'Already saved (hidden for safety). Leave empty to keep it.'
                  : 'Not your admin password. For Gmail: the 16-letter App password from Google, not your normal Gmail password. Saved securely and never shown again.'
              }
            >
              <div className="input-wrap">
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={saved.has_password ? '••••••••  (saved)' : ''}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-wrap__btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
          </Card>
        </div>

        <div className="stack stack--fill-last">
          <Card title="Alerts">
            <div className="switch-row">
              <Toggle
                checked={!!form.enabled}
                onChange={(v) => setForm({ ...form, enabled: v })}
                label="Email me when the password changes"
              />
              <span>Email me when the password changes</span>
            </div>
            <div className={`status-box ${ready ? 'is-ok' : ''}`}>
              {ready ? (
                <>
                  <CheckCircle2 size={18} /> Settings complete{saved.enabled ? ' · alerts are on' : ' · switch alerts on and save'}
                </>
              ) : (
                <>
                  <Info size={18} /> Still needed: {saved.missing.join(', ')}
                </>
              )}
            </div>
            <Button type="button" variant="ghost" icon={Send} loading={testing} onClick={sendTest}>
              Send test email
            </Button>
            <p className="field__hint">Saves what is on screen, then sends a test to the “Send alerts to” address.</p>
          </Card>

          <Card title="Who sends and who receives">
            <div className="row-2">
              <Field label="Sender email" hint="Usually the same email address as above">
                <input className="input" type="email" value={form.from_email} onChange={set('from_email')} />
              </Field>
              <Field label="Sender name">
                <input className="input" value={form.from_name} onChange={set('from_name')} />
              </Field>
            </div>
            <Field label="Send alerts to" hint="This inbox gets the “admin password changed” email">
              <input className="input" type="email" value={form.alert_email} onChange={set('alert_email')} />
            </Field>
          </Card>
        </div>
      </div>
    </form>
  )
}
