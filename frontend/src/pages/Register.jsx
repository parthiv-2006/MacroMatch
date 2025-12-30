import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'
import ValidationError from '../components/ValidationError'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0b1524] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-lg p-10 rounded-xl shadow-lg border border-white/10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Login here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:text-sm transition-all duration-200"
                  style={{
                    borderColor: errors.name ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: errors.name ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                  }}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: '' })
                  }}
                />
                <ValidationError show={!!errors.name} message={errors.name} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:text-sm transition-all duration-200"
                  style={{
                    borderColor: errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: errors.email ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                  }}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                />
                <ValidationError show={!!errors.email} message={errors.email} />
              </div>
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
                  className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:text-sm transition-all duration-200"
                  style={{
                    borderColor: errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: errors.password ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                  }}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                />
                <ValidationError show={!!errors.password} message={errors.password} />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:text-sm transition-all duration-200"
                  style={{
                    borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: errors.confirmPassword ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                  }}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                  }}
                />
                <ValidationError show={!!errors.confirmPassword} message={errors.confirmPassword} />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
