import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/recipes/'

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` }
    }
    return {}
}

const getRecipes = async () => {
    const config = { headers: getAuthHeader() }
    const response = await axios.get(API_URL, config)
    return response.data
}

const createRecipe = async (recipeData) => {
    const config = { headers: getAuthHeader() }
    const response = await axios.post(API_URL, recipeData, config)
    return response.data
}

const deleteRecipe = async (id) => {
    const config = { headers: getAuthHeader() }
    const response = await axios.delete(API_URL + id, config)
    return response.data
}

const updateRecipe = async (id, recipeData) => {
    const config = { headers: getAuthHeader() }
    const response = await axios.put(API_URL + id, recipeData, config)
    return response.data
}

const recipeServices = { getRecipes, createRecipe, deleteRecipe, updateRecipe }
export default recipeServices