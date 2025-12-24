import { createContext, useState, useEffect } from 'react'
import authService from '../services/authServices'

const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const register = async (userData) => {
        const data = await authService.register(userData)
        setUser(data)
        return data
    }

    const login = async (userData) => {
        const data = await authService.login(userData)
        setUser(data)
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    return <AuthContext.Provider value={{user, login, register, logout}}>
        {children}
    </AuthContext.Provider>
}