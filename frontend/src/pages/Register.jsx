import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingScreen from '../components/LoadingScreen'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/ui/PasswordInput'

// Mirrors the backend password policy in userController.validatePassword
const passwordRules = [
  { id: 'length',  label: '8–16 characters',     test: pw => pw.length >= 8 && pw.length <= 16 },
  { id: 'lower',   label: 'A lowercase letter',  test: pw => /[a-z]/.test(pw) },
  { id: 'upper',   label: 'An uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { id: 'number',  label: 'A number',            test: pw => /[0-9]/.test(pw) },
  { id: 'special', label: 'A special character', test: pw => /[^A-Za-z0-9]/.test(pw) },
]

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

  const ruleResults = passwordRules.map(rule => ({ ...rule, passed: rule.test(formData.password) }))
  const passedCount = ruleResults.filter(r => r.passed).length
  const strengthColor = passedCount <= 2 ? 'var(--fat)' : passedCount <= 4 ? 'var(--warn)' : 'var(--green)'

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
    } else if (ruleResults.some(r => !r.passed)) {
      newErrors.password = 'Password does not meet all requirements'
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

  const setField = (key) => (e) => {
    setFormData({ ...formData, [key]: e.target.value })
    if (errors[key]) setErrors({ ...errors, [key]: '' })
  }

  const fieldError = (key) =>
    errors[key] && <p style={{ color: 'var(--fat)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors[key]}</p>

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }
  const textInputStyle = (key) => ({
    width: '100%', padding: '9px 12px', fontSize: 13,
    borderColor: errors[key] ? 'var(--fat)' : undefined,
    boxSizing: 'border-box',
  })

  if (isLoading) return <LoadingScreen message="Creating your account..." />

  return (
    <AuthLayout>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
          Get started
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" placeholder="Jane Smith" autoComplete="name" value={formData.name} onChange={setField('name')} style={textInputStyle('name')} />
          {fieldError('name')}
        </div>

        <div>
          <label style={labelStyle}>Email address</label>
          <input type="email" placeholder="you@example.com" autoComplete="email" value={formData.email} onChange={setField('email')} style={textInputStyle('email')} />
          {fieldError('email')}
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <PasswordInput autoComplete="new-password" value={formData.password} hasError={!!errors.password} onChange={setField('password')} />
          {fieldError('password')}

          {/* Strength meter + requirement checklist */}
          {formData.password && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {passwordRules.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < passedCount ? strengthColor : 'var(--surface2)', transition: 'background .2s' }} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                {ruleResults.map(({ id, label, passed }) => (
                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: passed ? 'var(--green)' : 'var(--text-3)', transition: 'color .15s' }}>
                    {passed ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <span style={{ width: 10, height: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>·</span>
                    )}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Confirm Password</label>
          <PasswordInput autoComplete="new-password" value={formData.confirmPassword} hasError={!!errors.confirmPassword} onChange={setField('confirmPassword')} />
          {fieldError('confirmPassword')}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p style={{ color: 'var(--green)', fontSize: 11, marginTop: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Passwords match
            </p>
          )}
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
          Create Account
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
