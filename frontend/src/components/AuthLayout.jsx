// Split-screen wrapper for the login/register pages: branding panel left, form right.
const Logo = ({ size = 36 }) => (
  <div style={{
    width: size, height: size,
    background: 'linear-gradient(135deg,#16a34a,#0d9488)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  </div>
)

const features = [
  {
    title: 'Solve, don\'t guess',
    desc: 'Linear programming computes exact ingredient quantities to hit your macro targets.',
    icon: <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9"/>,
  },
  {
    title: 'Pantry-aware planning',
    desc: 'Meals are generated from what you actually have, with low-stock alerts built in.',
    icon: <path d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8"/>,
  },
  {
    title: 'Track every gram',
    desc: 'Daily targets, logging streaks, and macro trends — all on one dashboard.',
    icon: <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>,
  },
]

const macroLegend = [
  { label: 'Protein', color: 'var(--protein)' },
  { label: 'Carbs', color: 'var(--carbs)' },
  { label: 'Fats', color: 'var(--fat)' },
]

const AuthLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
    {/* Branding panel */}
    <div className="auth-brand-panel" style={{
      flex: '1 1 50%',
      background: 'linear-gradient(160deg, #060809 0%, #0a1410 55%, #07120e 100%)',
      borderRight: '1px solid var(--border)',
      padding: '56px 64px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative ring */}
      <svg width="520" height="520" viewBox="0 0 520 520" style={{ position: 'absolute', right: -160, bottom: -160, opacity: .14 }}>
        <circle cx="260" cy="260" r="200" fill="none" stroke="var(--protein)" strokeWidth="34" strokeDasharray="440 1257" strokeLinecap="round" transform="rotate(-90 260 260)"/>
        <circle cx="260" cy="260" r="200" fill="none" stroke="var(--carbs)" strokeWidth="34" strokeDasharray="380 1257" strokeDashoffset="-470" strokeLinecap="round" transform="rotate(-90 260 260)"/>
        <circle cx="260" cy="260" r="200" fill="none" stroke="var(--fat)" strokeWidth="34" strokeDasharray="300 1257" strokeDashoffset="-880" strokeLinecap="round" transform="rotate(-90 260 260)"/>
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <Logo size={38} />
        <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>MacroMatch</span>
      </div>

      <div style={{ position: 'relative', maxWidth: 440 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
          Hit your macros with <span style={{ background: 'linear-gradient(135deg,#22c55e,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>mathematical precision</span>.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 36 }}>
          {features.map(({ title, desc, icon }) => (
            <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
        {macroLegend.map(({ label, color }) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>

    {/* Form panel */}
    <div style={{ flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
          <Logo size={34} />
          <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>MacroMatch</span>
        </div>
        {children}
      </div>
    </div>
  </div>
)

export default AuthLayout
