import { Link } from 'react-router-dom'

export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Pune Scenes home">
      <span className="brand-mark">P</span>
      <span>Pune Scenes</span>
    </Link>
  )
}
