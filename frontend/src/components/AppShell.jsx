import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useMemo } from 'react'
import AuthContext from '../context/AuthContext'
import { LayoutDashboard, History, ChefHat, Carrot, Wand2, LogOut } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Pantry', icon: Carrot },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/recipes', label: 'Recipes', icon: ChefHat }
]

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AuthContext)

  const activePath = useMemo(() => {
    const match = navLinks.find((link) => location.pathname === link.to)
    return match ? match.to : location.pathname
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-inter">
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-soft-sm shadow-emerald-500/30">
                <Wand2 size={18} strokeWidth={2.5} />
              </div>
              MacroMatch
            </button>
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activePath === link.to;
                return (
                  <button
                    key={link.to}
                    onClick={() => navigate(link.to)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out ${
                      isActive
                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-900 flex-1'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/generate')}
              className={`hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out ${
                 activePath === '/generate'
                  ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-0.5'
              }`}
            >
              <Wand2 size={16} strokeWidth={2.5} />
              Generate Plan
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <button
              onClick={() => logout()}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 ease-in-out font-bold"
              title="Logout"
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
