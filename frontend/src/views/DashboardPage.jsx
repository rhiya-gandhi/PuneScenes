import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Brand from '../components/Brand'
import { useAuth } from '../controllers/AuthProvider'
import { useToast } from '../components/ToastProvider'
import AdminDashboard from './dashboards/AdminDashboard'
import HostDashboard from './dashboards/HostDashboard'
import ViewerDashboard from './dashboards/ViewerDashboard'

const roleDashboards = {
  viewer: ViewerDashboard,
  host: HostDashboard,
  admin: AdminDashboard,
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const { role } = useParams()
  if (role && role !== user.role) return <Navigate to={`/dashboard/${user.role}`} replace />

  async function handleLogout() {
    try {
      await logout()
      notify('You have been logged out.', 'success')
    } catch {
      notify('You are logged out on this device, but the server could not confirm token invalidation.', 'error')
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  const RoleDashboard = roleDashboards[user.role] || ViewerDashboard

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <Brand />
        <div className="topbar-right">
          <span className="topbar-email">{user.email}</span>
          <button className="quiet-button" type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">Your dashboard</span>
            <h1>Hello, {displayName}</h1>
            <p>Welcome to Pune Scenes.</p>
          </div>
          <span className="role-badge">{user.role}</span>
        </div>
        <article className="dashboard-card">
          <RoleDashboard user={user} />
        </article>
      </section>
    </main>
  )
}
