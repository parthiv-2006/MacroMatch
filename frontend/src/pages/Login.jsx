import { useState, useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'
import ValidationError from '../components/ValidationError'
import { ArrowRight, Wand2 } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) logout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)
    try {
      await login({ email: formData.email, password: formData.password })
      await new Promise(resolve => setTimeout(resolve, 800))
      navigate('/')
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login Failed'
      toast.error(message)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Signing you in..." />
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-[360px] flex flex-col space-y-8">
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-soft-sm shadow-brand-500/30">
              <Wand2 size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MacroMatch</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                Register here
              </Link>
            </p>
          </div>

          <form className="space-y-6 mt-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 bg-white border rounded-xl shadow-soft-sm text-slate-900 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-4 top-4 text-slate-500 font-medium text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-brand-600 pointer-events-none"
                >
                  Email address
                </label>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 bg-white border rounded-xl shadow-soft-sm text-slate-900 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                />
                 <label 
                  htmlFor="password" 
                  className="absolute left-4 top-4 text-slate-500 font-medium text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-brand-600 pointer-events-none"
                >
                  Password
                </label>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-semibold text-brand-600 hover:text-brand-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200 shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-0.5"
              >
                Sign in
                <ArrowRight className="ml-2 h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Right side: Abstract visual */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-linear-to-br from-brand-900 via-brand-800 to-slate-900" />
        
        {/* Abstract decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl mix-blend-overlay" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-400/20 rounded-full blur-3xl mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-center text-white">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Nourish your body.<br/><span className="text-brand-300">Intelligently.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            MacroMatch creates bespoke meal plans tailored perfectly to your nutritional goals, taking the guesswork out of eating well.
          </p>

          {/* Floating UI mock element for visual flair */}
          <div className="mt-12 bg-white/10 backdrop-blur-lg w-full max-w-sm p-6 rounded-2xl shadow-soft-xl border border-white/20 flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
            <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center">
              <span className="text-brand-300 font-bold text-lg">P</span>
            </div>
            <div className="flex-1 text-left">
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-brand-400 w-3/4 rounded-full" />
              </div>
              <p className="mt-2 text-sm text-white font-bold">Protein target: 120g / 160g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
