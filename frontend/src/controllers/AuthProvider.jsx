import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../models/authApi'
import { authStorage } from '../models/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function restoreSession() {
      if (!authStorage.getAccess() && !authStorage.getRefresh()) {
        setLoading(false)
        return
      }
      try {
        const current = await authService.currentUser()
        if (active) setUser(current)
      } catch {
        authStorage.clear()
      } finally {
        if (active) setLoading(false)
      }
    }
    restoreSession()
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      await authService.login(credentials)
      const current = await authService.currentUser()
      setUser(current)
      return current
    },
    async register(payload) {
      return authService.register(payload)
    },
    async logout() {
      try {
        await authService.logout()
      } finally {
        setUser(null)
      }
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
