import ProfileDetail from '../../components/ProfileDetail'

export default function ViewerDashboard({ user }) {
  return (
    <>
      <h2>Your Pune Scenes account</h2>
      <p>Your account is ready. Event discovery and saved plans will be added in a later project phase.</p>
      <div className="detail-grid">
        <ProfileDetail label="Home area" value={user.profile?.home_area} />
        <ProfileDetail label="Interests" value={user.profile?.interests?.join(', ')} />
      </div>
    </>
  )
}
