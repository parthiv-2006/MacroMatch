import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authServices'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData)
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  }, [])

  const login = useCallback(async (userData) => {
    const data = await authService.login(userData)
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext