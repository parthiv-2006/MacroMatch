import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useMemo } from 'react'
import AuthContext from '../context/AuthContext'

const navLinks = [
  { to: '/',          label: 'Pantry',    icon: PantryIcon },
  { to: '/dashboard', label: 'Dashboard', icon: DashIcon },
  { to: '/history',   label: 'History',   icon: HistoryIcon },
  { to: '/recipes',   label: 'Recipes',   icon: RecipesIcon },
]

function PantryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v4H3z"/><path d="M5 7v14M19 7v14M9 11h6M9 14h6"/>
    </svg>
  )
}
function DashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function HistoryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
    </svg>
  )
}
function RecipesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}
function GenerateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AuthContext)

  const activePath = useMemo(() => {
    const match = navLinks.find(link => location.pathname === link.to)
    return match ? match.to : location.pathname
  }, [location.pathname])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg,#16a34a,#0d9488)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
            MacroMatch
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(item => {
            const active = activePath === item.to
            const Icon = item.icon
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.background = 'rgba(255,255,255,.05)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#9aa3af'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px',
                  background: active ? 'rgba(22,163,74,.15)' : 'transparent',
                  border: active ? '1px solid rgba(22,163,74,.3)' : '1px solid transparent',
                  borderRadius: 8,
                  color: active ? '#4ade80' : '#9aa3af',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                  fontFamily: 'var(--font)',
                }}
              >
                <Icon />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/generate')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: activePath === '/generate'
                ? 'rgba(34,197,94,.15)'
                : 'linear-gradient(135deg,#16a34a,#0d9488)',
              border: activePath === '/generate' ? '1px solid rgba(34,197,94,.3)' : 'none',
              color: activePath === '/generate' ? '#4ade80' : 'white',
              borderRadius: 8, padding: '7px 16px',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font)',
              boxShadow: activePath === '/generate' ? 'none' : '0 2px 8px rgba(22,163,74,.3)',
              transition: 'all .15s ease',
            }}
          >
            <GenerateIcon />
            Generate Plan
          </button>
          <button
            onClick={() => logout()}
            title="Logout"
            style={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,.07)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 8,
              color: '#9aa3af',
              cursor: 'pointer',
              transition: 'all .15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9aa3af'; e.currentTarget.style.background = 'rgba(255,255,255,.07)' }}
          >
            <LogoutIcon />
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto', padding: '48px 48px' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
