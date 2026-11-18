import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../controllers/AuthProvider'
import { getApiError } from '../models/authApi'
import { validateEmail } from '../models/formValidation'

export default function LoginPage() {
  const { login } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const emailError = validateEmail(email)
    const passwordError = password ? '' : 'Please enter your password.'
    const nextErrors = { email: emailError, password: passwordError }
    setFieldErrors(nextErrors)
    const firstError = emailError || passwordError
    if (firstError) {
      setError(firstError)
      notify(firstError, 'error')
      return
    }

    setSubmitting(true)
    try {
      const user = await login({ email: email.trim(), password })
      notify(`Logged in successfully. Welcome, ${user.first_name || user.email}!`, 'success')
      navigate(`/dashboard/${user.role}`, { replace: true })
    } catch (requestError) {
      const message = getApiError(requestError)
      setError(message)
      notify(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-intro">Log in to find your next Pune moment.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: '' })) }}
              onBlur={() => {
                const message = validateEmail(email)
                setFieldErrors((current) => ({ ...current, email: message }))
                if (message) notify(message, 'error')
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: '' })) }}
            onBlur={() => {
              const message = password ? '' : 'Please enter your password.'
              setFieldErrors((current) => ({ ...current, password: message }))
              if (message) notify(message, 'error')
            }}
            autoComplete="current-password"
            error={fieldErrors.password}
          />
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="auth-foot">New to Pune Scenes? <Link className="text-link" to="/register">Create an account</Link></p>
      </div>
    </AuthLayout>
  )
}
