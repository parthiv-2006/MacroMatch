import { useState, useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/ui/PasswordInput'

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

  if (isLoading) return <LoadingScreen message="Signing you in..." />

  return (
    <AuthLayout>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
          Welcome back
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Sign in to your account
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={e => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) setErrors({ ...errors, email: '' })
            }}
            style={{
              width: '100%', padding: '9px 12px', fontSize: 13,
              borderColor: errors.email ? 'var(--fat)' : undefined,
              boxSizing: 'border-box',
            }}
          />
          {errors.email && <p style={{ color: 'var(--fat)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors.email}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            Password
          </label>
          <PasswordInput
            autoComplete="current-password"
            value={formData.password}
            hasError={!!errors.password}
            onChange={e => {
              setFormData({ ...formData, password: e.target.value })
              if (errors.password) setErrors({ ...errors, password: '' })
            }}
          />
          {errors.password && <p style={{ color: 'var(--fat)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors.password}</p>}
        </div>

        <button
          type="submit"
          style={{
            marginTop: 8, width: '100%', padding: '11px',
            background: 'linear-gradient(135deg,#16a34a,#0d9488)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            color: 'white', fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--font)', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(22,163,74,.3)',
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
