import { useState } from 'react'
import { KeyRound, Save } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { useAuth } from '../AuthContext'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader } from '../components/ui'

const empty = { currentPassword: '', newPassword: '', confirm: '' }

export default function AccountPage() {
  const { admin } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return toast('New passwords do not match', 'error')
    setSaving(true)
    try {
      const res = await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm(empty)
      const { emailSent, emailTo } = res.data.data ?? {}
      toast(emailSent ? `Password changed. Confirmation sent to ${emailTo}` : 'Password changed')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader icon={KeyRound} title="My Account" subtitle={`Signed in as ${admin.email}`} />
      <form onSubmit={save} className="narrow">
        <Card
          title="Change password"
          subtitle="Use at least 8 characters. A confirmation email is sent if Email Alerts are switched on."
        >
          <Field label="Current password">
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={form.currentPassword}
              onChange={set('currentPassword')}
            />
          </Field>
          <Field label="New password">
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.newPassword}
              onChange={set('newPassword')}
            />
          </Field>
          <Field label="Type new password again">
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirm}
              onChange={set('confirm')}
            />
          </Field>
          <div className="card__foot">
            <span />
            <Button type="submit" icon={Save} loading={saving}>
              Update password
            </Button>
          </div>
        </Card>
      </form>
    </>
  )
}
