import ProfileDetail from '../../components/ProfileDetail'

export default function HostDashboard({ user }) {
  return (
    <>
      <h2>Your host workspace</h2>
      <p>Your organization profile is ready. Event publishing will be added in a later project phase.</p>
      <div className="detail-grid">
        <ProfileDetail label="Organization" value={user.profile?.organization_name} />
        <ProfileDetail label="Host type" value={user.profile?.host_type} />
        <ProfileDetail label="Website" value={user.profile?.website_url} />
        <ProfileDetail label="About" value={user.profile?.about} />
      </div>
    </>
  )
}
