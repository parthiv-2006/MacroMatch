import axios from 'axios'

const API_URL = '/api/generate/'

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` }
    }
    return {}
}

const generateMeal = async(targets) => {
    const config = {headers: getAuthHeader()}
    const response = await axios.post(API_URL, targets, config)
    return response.data
}

const generateReverseMeal = async(targets) => {
    const config = { headers: getAuthHeader() }
    const response = await axios.post(API_URL + 'reverse', targets, config)
    return response.data
}

const solverServices = { generateMeal, generateReverseMeal }
export default solverServices