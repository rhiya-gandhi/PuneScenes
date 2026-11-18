import ProfileDetail from '../../components/ProfileDetail'

export default function AdminDashboard() {
  return (
    <>
      <h2>Administration</h2>
      <p>You are signed in with an administrator account. User and profile records can be managed in Django Admin.</p>
      <div className="dashboard-note">Admin accounts are created by a project administrator. They cannot be created from public registration.</div>
      <div className="detail-grid">
        <ProfileDetail label="Account role" value="Administrator" />
        <ProfileDetail
          label="Admin console"
          value={<a className="text-link" href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer">Open Django Admin ↗</a>}
        />
      </div>
    </>
  )
}
