import Brand from './Brand'

export default function AuthLayout({ children, mode }) {
  const isRegister = mode === 'register'
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Pune Scenes introduction">
        <Brand />
        <div className="story-copy">
          <span className="eyebrow">Made for Pune</span>
          <h1>{isRegister ? 'Find your people. Make a scene.' : 'The city is better when you go out.'}</h1>
          <p>Discover the experiences, gatherings and local communities that make Pune feel like home.</p>
        </div>
        <div className="story-notes" aria-label="Account types">
          <span className="story-chip">For curious locals</span>
          <span className="story-chip">For event hosts</span>
          <span className="story-chip">Built around Pune</span>
        </div>
      </section>
      <section className="auth-main">{children}</section>
    </main>
  )
}
