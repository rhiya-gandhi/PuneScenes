import axios from 'axios'
import { authStorage } from './authStorage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/accounts/'

export const authApi = axios.create({ baseURL: apiBaseUrl, timeout: 10000 })

authApi.interceptors.request.use((config) => {
  const access = authStorage.getAccess()
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

let refreshInFlight
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthEndpoint = /\/(login|register|token\/refresh)\//.test(original?.url || '')
    if (error.response?.status !== 401 || !original || original._retried || isAuthEndpoint) {
      return Promise.reject(error)
    }

    const refresh = authStorage.getRefresh()
    if (!refresh) {
      authStorage.clear()
      return Promise.reject(error)
    }

    original._retried = true
    try {
      refreshInFlight ||= axios
        .post(`${apiBaseUrl}token/refresh/`, { refresh }, { timeout: 10000 })
        .then(({ data }) => {
          authStorage.save(data)
          return data
        })
        .finally(() => { refreshInFlight = undefined })

      const tokens = await refreshInFlight
      if (original.url?.includes('logout/')) {
        original.data = { refresh: tokens.refresh || authStorage.getRefresh() }
      }
      return authApi(original)
    } catch (refreshError) {
      authStorage.clear()
      return Promise.reject(refreshError)
    }
  },
)

export const authService = {
  async register(payload) {
    const { data } = await authApi.post('register/', payload)
    return data
  },
  async login(credentials) {
    const { data } = await authApi.post('login/', credentials)
    authStorage.save(data)
    return data
  },
  async currentUser() {
    const { data } = await authApi.get('me/')
    return data
  },
  async logout() {
    const refresh = authStorage.getRefresh()
    try {
      if (refresh) await authApi.post('logout/', { refresh })
    } finally {
      authStorage.clear()
    }
  },
}

export function getApiError(error) {
  const data = error.response?.data
  if (!data) return 'Unable to reach the server. Make sure Django is running.'
  if (typeof data.detail === 'string') {
    if (data.detail.toLowerCase().includes('no active account found')) {
      return 'Email or password is incorrect. Please check your details and try again.'
    }
    return data.detail
  }
  if (typeof data === 'string') return data
  return Object.entries(data)
    .flatMap(([field, messages]) => {
      const label = field === 'non_field_errors' ? '' : `${field.replaceAll('_', ' ')}: `
      return (Array.isArray(messages) ? messages : [messages]).map((message) => `${label}${message}`)
    })
    .join(' ')
}
