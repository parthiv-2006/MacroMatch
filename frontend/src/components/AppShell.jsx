import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useMemo } from 'react'
import AuthContext from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Pantry' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/recipes', label: 'Recipes' }
]

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AuthContext)

  const activePath = useMemo(() => {
    if (location.pathname.startsWith('/generate')) return '/generate'
    if (location.pathname.startsWith('/new-ingredient')) return '/new-ingredient'
    const match = navLinks.find((link) => location.pathname === link.to)
    return match ? match.to : location.pathname
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#0b1524] text-white">
      <nav className="bg-[#0f1c2f]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/')}
              className="text-xl sm:text-2xl font-bold bg-linear-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text tracking-tight"
            >
              MacroMatch
            </button>
            <div className="hidden sm:flex items-center space-x-1 text-sm">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activePath === link.to
                      ? 'bg-white/10 text-white border border-white/10 shadow-inner'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/generate')}
              className={`hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold shadow-lg transition ${
                activePath === '/generate'
                  ? 'bg-linear-to-r from-emerald-400 to-teal-300 text-slate-900'
                  : 'bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
              }`}
            >
              Generate Plan
            </button>
            <button
              onClick={() => logout()}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 border border-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
