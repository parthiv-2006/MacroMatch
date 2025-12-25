import axios from 'axios'

const API_URL = '/api/ingredients/'

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` }
    }
    return {}
}

const getIngredients = async() => {
    const config = { headers: getAuthHeader()}
    const response = await axios.get(API_URL, config)
    return response.data
}

const createIngredient = async(itemData) => {
    const config = { headers: getAuthHeader()}
    const response = await axios.post(API_URL, itemData, config)
    return response.data
}

const ingredientServices = { getIngredients, createIngredient }
export default ingredientServices