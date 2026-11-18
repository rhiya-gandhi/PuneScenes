export default function ProfileDetail({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || 'Not added yet'}</span>
    </div>
  )
}
