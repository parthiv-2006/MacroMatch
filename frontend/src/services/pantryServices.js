import axios from 'axios'

const API_URL = '/api/pantry/'

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` }
    }
    return {}
}

const getPantryItems = async() => {
        const config = { headers: getAuthHeader()}
        const response = await axios.get(API_URL, config)
        return response.data
}

const getLowStockItems = async () => {
    const config = { headers: getAuthHeader() }
    const response = await axios.get(API_URL + 'low-stock', config)
    return response.data
}

const addPantryItem = async (itemData) => {
    const config = { headers: getAuthHeader()}
    const response = await axios.post(API_URL, itemData, config)
    return response.data    
}

const updatePantryItem = async (id, itemData) => {
    const config = { headers: getAuthHeader()}
    const response = await axios.put(API_URL + id, itemData, config)
    return response.data
}

const deletePantryItem = async (id) => {
    const config = { headers: getAuthHeader() }
    const response = await axios.delete(API_URL + id, config)
    return response.data
}

const consumePantryItems = async (ingredients) => {
    const config = { headers: getAuthHeader() }
    const response = await axios.post(API_URL + 'consume', { ingredients }, config)
    return response.data
}

const getMealHistory = async () => {
    const config = { headers: getAuthHeader() }
    const response = await axios.get(API_URL + 'history', config)
    return response.data
}

const pantryServices = {getPantryItems, getLowStockItems, addPantryItem, updatePantryItem, deletePantryItem, consumePantryItems, getMealHistory}
export default pantryServices