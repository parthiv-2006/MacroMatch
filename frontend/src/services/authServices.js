import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/user/'

const register = async (userData) => {
    const response = await axios.post(API_URL, userData)
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
}

const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData)
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
}

const logout = () => {
    localStorage.removeItem('user')
}

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` }
    }
    return {}
}

const getProfile = async () => {
    const response = await axios.get(API_URL + 'me', { headers: getAuthHeader() })
    return response.data
}

const updateGoals = async (goals) => {
    const response = await axios.put(API_URL + 'goals', goals, { headers: getAuthHeader() })
    return response.data
}

const authService = {register, login, logout, getProfile, updateGoals}

export default authService