import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './controllers/AuthProvider'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import DashboardPage from './views/DashboardPage'
import './App.css'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading Pune Scenes…</div>
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading Pune Scenes…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard/:role?" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
