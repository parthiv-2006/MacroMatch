import { createContext, useState, useCallback } from 'react'
import authService from '../services/authServices'

const AuthContext = createContext()

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser)
  const loading = false // user is restored synchronously from localStorage

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

  // Merge partial updates (e.g. new goals) into the stored user
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext