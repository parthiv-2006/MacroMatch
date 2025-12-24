import {useState, useContext} from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({email: '', password: ''})
  const {login} = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        await login({email: formData.email, password: formData.password})
        navigate('/')
    } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Login Failed'
        alert(message)
    }
  }
  
    return (
    <div className='login-form'>
        <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <label>
            Email:
            <input type='email' placeholder='jake@example.com' required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}/>
        </label>
        <label>
            Password:
            <input type='password' required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}/>
        </label>
        <button type='submit'>Login</button>
      </form>
    </div>
  )
}

export default Login
