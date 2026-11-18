import { useState } from 'react'

export default function PasswordField({ id, label, value, onChange, onBlur, required = true, autoComplete, hint, error, criteria = [], minLength }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : criteria.length ? `${id}-criteria` : hint ? `${id}-hint` : undefined}
        />
        <button className="show-password" type="button" onClick={() => setVisible((show) => !show)}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
      {criteria.length > 0 && (
        <ul className="password-checks" id={`${id}-criteria`} aria-live="polite">
          {criteria.map((criterion) => (
            <li className={criterion.valid ? 'check-valid' : 'check-pending'} key={criterion.label}>
              <span aria-hidden="true">{criterion.valid ? '✓' : '○'}</span> {criterion.label}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}
