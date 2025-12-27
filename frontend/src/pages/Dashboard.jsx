import {useState, useEffect} from 'react'
import AddItemForm from '../components/AddItemForm'
import PantryList from '../components/PantryList'
import pantryServices from '../services/pantryServices'

const Dashboard = () => {
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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


  return (
    <div className='dashboard-container'>
      <h1>My Kitchen Pantry</h1>

      <div className='add-item-section'>
        <AddItemForm onItemAdded={fetchPantry}/>
      </div>

      {loading ? (<p>Loading Pantry...</p>) : 
      error ? (<p>{error}</p>): 
      (<PantryList items={pantryItems} onDelete={handleDelete}/>)}
    </div>
  )
}

export default Dashboard
