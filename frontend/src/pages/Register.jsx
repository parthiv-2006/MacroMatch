import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { register, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) logout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Full name is required'
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
      await register({ name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword })
      await new Promise(resolve => setTimeout(resolve, 800))
      navigate('/', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Registration Failed'
      toast.error(message)
      setIsLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div key={key}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={formData[key]}
        onChange={e => {
          setFormData({ ...formData, [key]: e.target.value })
          if (errors[key]) setErrors({ ...errors, [key]: '' })
        }}
        style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderColor: errors[key] ? 'var(--fat)' : undefined }}
      />
      {errors[key] && <p style={{ color: 'var(--fat)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors[key]}</p>}
    </div>
  )

  if (isLoading) return <LoadingScreen message="Creating your account..." />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#16a34a,#0d9488)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>MacroMatch</span>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px 32px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6 }}>
              Get started
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {field('name', 'Full Name', 'text', 'Jane Smith')}
            {field('email', 'Email address', 'email', 'you@example.com')}
            {field('password', 'Password', 'password', '••••••••')}
            {field('confirmPassword', 'Confirm Password', 'password', '••••••••')}

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
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
