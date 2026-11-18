const commonPasswords = new Set([
  'password', 'password1', 'password123', '12345678', 'qwerty123', 'letmein123',
])

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Please enter your email address.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
  return ''
}

export function getPasswordChecks(value, { firstName = '', lastName = '', email = '' } = {}) {
  const normalizedPassword = value.toLowerCase()
  const emailName = email.split('@')[0]
  let containsPersonalInfo = false
  for (const attribute of [firstName, lastName, emailName]) {
    const normalizedAttribute = attribute.trim().toLowerCase()
    if (normalizedAttribute.length >= 4 && normalizedPassword.includes(normalizedAttribute)) {
      containsPersonalInfo = true
    }
  }

  return [
    { label: 'At least 8 characters', valid: value.length >= 8 },
    { label: 'Not only numbers', valid: Boolean(value) && !/^\d+$/.test(value) },
    { label: 'Not a common password', valid: Boolean(value) && !commonPasswords.has(normalizedPassword) },
    { label: 'Does not contain your name or email name', valid: Boolean(value) && !containsPersonalInfo },
  ]
}

export function validatePassword(value, attributes = {}) {
  if (!value) return 'Please enter a password.'
  const checks = getPasswordChecks(value, attributes)
  const failed = checks.find((check) => !check.valid)
  if (!failed) return ''
  if (failed.label === 'At least 8 characters') return 'Password must be at least 8 characters long.'
  if (failed.label === 'Not only numbers') return 'Password cannot contain only numbers.'
  if (failed.label === 'Not a common password') return 'That password is too common. Please choose a stronger one.'
  return 'Password should not contain your name or email name.'
}

export function validateName(value, label) {
  if (!value.trim()) return `Please enter your ${label.toLowerCase()}.`
  return ''
}

export function validateOrganization(value) {
  if (!value.trim()) return 'Organization name is required for Host accounts.'
  return ''
}
