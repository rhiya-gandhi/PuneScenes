import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current.slice(-3), { id, message, type }])
    window.setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4200)
  }, [dismiss])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.type}`} key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'}>
            <span className="toast-symbol" aria-hidden="true">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-dismiss" type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss message">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const notify = useContext(ToastContext)
  if (!notify) throw new Error('useToast must be used inside ToastProvider')
  return notify
}
