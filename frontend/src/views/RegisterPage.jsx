import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import { useAuth } from '../controllers/AuthProvider'
import { useToast } from '../components/ToastProvider'
import { getApiError } from '../models/authApi'
import { getPasswordChecks, validateEmail, validateName, validateOrganization, validatePassword } from '../models/formValidation'

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  role: 'viewer',
  organization_name: '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (event) => {
      const value = event.target.value
      setForm((current) => ({ ...current, [field]: value }))
      setFieldErrors((current) => ({ ...current, [field]: '' }))
      setError('')
    }
  }

  function validateField(field, value = form[field]) {
    let message = ''
    if (field === 'first_name') message = validateName(value, 'First name')
    if (field === 'last_name') message = validateName(value, 'Last name')
    if (field === 'email') message = validateEmail(value)
    if (field === 'password') {
      message = validatePassword(value, {
        firstName: form.first_name,
        lastName: form.last_name,
        email: form.email,
      })
    }
    if (field === 'confirm_password' && value !== form.password) message = 'Passwords do not match.'
    if (field === 'organization_name' && form.role === 'host') message = validateOrganization(value)

    setFieldErrors((current) => ({ ...current, [field]: message }))
    if (message) notify(message, 'error')
    return message
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const checks = [
      ['first_name', validateName(form.first_name, 'First name')],
      ['last_name', validateName(form.last_name, 'Last name')],
      ['email', validateEmail(form.email)],
      ['password', validatePassword(form.password, {
        firstName: form.first_name,
        lastName: form.last_name,
        email: form.email,
      })],
      ['confirm_password', form.password === form.confirm_password ? '' : 'Passwords do not match.'],
      ['organization_name', form.role === 'host' ? validateOrganization(form.organization_name) : ''],
    ]
    const errors = Object.fromEntries(checks.filter(([, message]) => message))
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      const firstMessage = Object.values(errors)[0]
      setError(firstMessage)
      notify(firstMessage, 'error')
      return
    }

    setSubmitting(true)
    const payload = { ...form, email: form.email.trim() }
    if (payload.role !== 'host') delete payload.organization_name
    try {
      await register(payload)
      notify('Registration successful. Please log in with your new account.', 'success')
      navigate('/login', { replace: true })
    } catch (requestError) {
      const message = getApiError(requestError)
      setError(message)
      notify(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const passwordCriteria = getPasswordChecks(form.password, {
    firstName: form.first_name,
    lastName: form.last_name,
    email: form.email,
  })

  return (
    <AuthLayout mode="register">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="auth-intro">Join Pune Scenes as a local or an event host.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="field">
              <label htmlFor="first_name">First name</label>
              <input id="first_name" autoComplete="given-name" value={form.first_name} onChange={update('first_name')} onBlur={() => validateField('first_name')} aria-invalid={Boolean(fieldErrors.first_name)} required />
              {fieldErrors.first_name && <span className="field-error">{fieldErrors.first_name}</span>}
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" autoComplete="family-name" value={form.last_name} onChange={update('last_name')} onBlur={() => validateField('last_name')} aria-invalid={Boolean(fieldErrors.last_name)} required />
              {fieldErrors.last_name && <span className="field-error">{fieldErrors.last_name}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} onBlur={() => validateField('email')} aria-invalid={Boolean(fieldErrors.email)} required />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="role">I am joining as</label>
            <select id="role" value={form.role} onChange={update('role')}>
              <option value="viewer">Viewer — exploring Pune</option>
              <option value="host">Host — organizing experiences</option>
            </select>
          </div>
          {form.role === 'host' && (
            <div className="field">
              <label htmlFor="organization_name">Organization name</label>
              <input id="organization_name" value={form.organization_name} onChange={update('organization_name')} onBlur={() => validateField('organization_name')} aria-invalid={Boolean(fieldErrors.organization_name)} required />
              {fieldErrors.organization_name && <span className="field-error">{fieldErrors.organization_name}</span>}
            </div>
          )}
          <PasswordField
            id="password"
            label="Password"
            value={form.password}
            onChange={update('password')}
            onBlur={() => validateField('password')}
            autoComplete="new-password"
            minLength={8}
            criteria={form.password ? passwordCriteria : []}
            error={fieldErrors.password}
          />
          <PasswordField
            id="confirm_password"
            label="Confirm password"
            value={form.confirm_password}
            onChange={update('confirm_password')}
            onBlur={() => validateField('confirm_password')}
            autoComplete="new-password"
            error={fieldErrors.confirm_password}
          />
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-foot">Already have an account? <Link className="text-link" to="/login">Log in</Link></p>
      </div>
    </AuthLayout>
  )
}
