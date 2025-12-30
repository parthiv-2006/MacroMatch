import {useState, useContext, useEffect} from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'
import ValidationError from '../components/ValidationError'

const Login = () => {
  const [formData, setFormData] = useState({email: '', password: ''})
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const {login, logout} = useContext(AuthContext)
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
        await login({email: formData.email, password: formData.password})
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
    <div className="min-h-screen flex items-center justify-center bg-[#0b1524] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-lg p-10 rounded-xl shadow-lg border border-white/10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Register here
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value})
                    if (errors.email) setErrors({...errors, email: ''})
                  }}
                  style={{
                    borderColor: errors.email ? 'rgb(239, 68, 68)' : 'rgb(255, 255, 255, 0.1)',
                    boxShadow: errors.email ? '0 0 0 2px rgb(239, 68, 68, 0.1)' : 'none'
                  }}
                />
              </div>
              <ValidationError message={errors.email} show={!!errors.email} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value})
                    if (errors.password) setErrors({...errors, password: ''})
                  }}
                  style={{
                    borderColor: errors.password ? 'rgb(239, 68, 68)' : 'rgb(255, 255, 255, 0.1)',
                    boxShadow: errors.password ? '0 0 0 2px rgb(239, 68, 68, 0.1)' : 'none'
                  }}
                />
              </div>
              <ValidationError message={errors.password} show={!!errors.password} />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
