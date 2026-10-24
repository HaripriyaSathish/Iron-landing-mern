import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { errorMessage } from '../../lib/api'
import { Button, Field } from '../components/ui'

export default function Login() {
  const { admin, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (admin) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__art">
        <div className="login__art-inner">
          <span className="login__eyebrow">Studio Admin</span>
          <h1>Iron Me Ka</h1>
          <p>Every fold, every fabric — keep your website as neat as your finishing.</p>
          <div className="login__ornament" aria-hidden="true" />
        </div>
      </div>

      <div className="login__panel">
        <form className="login__form" onSubmit={submit}>
          <h2>Welcome back</h2>
          <p className="login__sub">Sign in to manage your website</p>

          {error && <div className="alert alert--error">{error}</div>}

          <Field label="Username or email">
            <input
              className="input"
              autoComplete="username"
              autoFocus
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Password">
            <div className="input-wrap">
              <input
                className="input"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="input-wrap__btn"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Button type="submit" icon={LogIn} loading={loading} className="btn btn--primary btn--block">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
