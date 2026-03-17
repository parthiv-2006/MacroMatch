import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'
import ValidationError from '../components/ValidationError'
import { ArrowRight, Wand2 } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { register, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    // Force fresh login only if there was an existing session when entering this page.
    const storedUser = localStorage.getItem('user')
    if (storedUser) logout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      await new Promise(resolve => setTimeout(resolve, 800))
      navigate('/', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Registration Failed'
      toast.error(message)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Creating your account..." />
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left side: Abstract visual */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-linear-to-tl from-brand-900 via-brand-800 to-slate-900" />
        
        {/* Abstract decorative blobs */}
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl mix-blend-overlay" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-400/20 rounded-full blur-3xl mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-center text-white">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Start your journey.<br/><span className="text-brand-300">Today.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md mb-8">
            Create an account to track your pantry, automatically generate recipes, and effortlessly hit your macronutrient goals.
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md opacity-90">
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-soft-lg flex flex-col items-center justify-center gap-2 border border-white/20">
              <div className="text-3xl font-bold text-brand-300">10k+</div>
              <div className="text-sm font-bold text-white">Generated Recipes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-soft-lg flex flex-col items-center justify-center gap-2 border border-white/20">
              <div className="text-3xl font-bold text-brand-300">100%</div>
              <div className="text-sm font-bold text-white">Goal Alignment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-[360px] flex flex-col space-y-8">
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-soft-sm shadow-brand-500/30">
              <Wand2 size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MacroMatch</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                Log in
              </Link>
            </p>
          </div>

          <form className="space-y-6 mt-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 bg-white border rounded-xl shadow-soft-sm text-slate-900 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: '' })
                  }}
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-4 top-4 text-slate-500 font-medium text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-brand-600 pointer-events-none"
                >
                  Full Name
                </label>
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.name}</p>
                )}
              </div>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
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

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 bg-white border rounded-xl shadow-soft-sm text-slate-900 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                  }}
                />
                 <label 
                  htmlFor="confirmPassword" 
                  className="absolute left-4 top-4 text-slate-500 font-medium text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-brand-600 pointer-events-none"
                >
                  Confirm Password
                </label>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200 shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-0.5"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Register
