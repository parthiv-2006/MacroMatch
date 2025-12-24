import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
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
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      navigate('/', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Registration Failed'
      alert(message)
    }
  }

  return (
    <div className='register-container'>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type='text'
            id='name'
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </label>
        <label>
          Email:
          <input
            type='email'
            id='email'
            value={formData.email}
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </label>
        <label>
          Password:
          <input
            type='password'
            id='password'
            value={formData.password}
            required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </label>
        <label>
          Confirm Password:
          <input
            type='password'
            id='confirmPassword'
            value={formData.confirmPassword}
            required
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </label>
        <button type='submit'>Register</button>
      </form>
    </div>
  )
}

export default Register
