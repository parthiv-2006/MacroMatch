import {useState, useEffect} from 'react'
import AddItemForm from '../components/AddItemForm'
import PantryList from '../components/PantryList'
import pantryServices from '../services/pantryServices'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchPantry = async () => {
    try {
      const data = await pantryServices.getPantryItems()
      setPantryItems(data)
    } catch(err) {
      setError('Failed to load pantry items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPantry()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return
    try {
    await pantryServices.deletePantryItem(id)
    setPantryItems(items => items.filter(item => item._id !== id))
  }  catch(err) {
      alert("Failed to delete Pantry Item")
  }
}
  const handleNavigate = () => {
    navigate('/new-ingredient')
  }

  const handleUpdate = async (id, newQuantity) => {
    try {
    await pantryServices.updatePantryItem(id, { quantity: newQuantity })
    setPantryItems(items => items.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ))
  } catch (err) {
    alert('Failed to update item')
  }
  }

  return (
    <div className='dashboard-container'>
      <h1>My Kitchen Pantry</h1>

      <div className='add-item-section'>
        <AddItemForm onItemAdded={fetchPantry}/>
      </div>

      <div>
        <p>Can't find what you're looking for?</p>
        <button onClick={handleNavigate}>Create Ingredient</button>
      </div>
      

      {loading ? (<p>Loading Pantry...</p>) : 
      error ? (<p>{error}</p>): 
      (<PantryList items={pantryItems} onDelete={handleDelete} onUpdate={handleUpdate}/>)}
    </div>
  )
}

export default Dashboard
