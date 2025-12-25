import {useState, useEffect} from 'react'
import ingredientServices from '../services/ingredientServices'
import pantryServices from '../services/pantryServices'


const AddItemForm = ({ onItemAdded }) => {
  const [ingredients, setIngredients] = useState([])
  const [selectedIngredient, setSelectedIngredient] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchIngredients = async() => {
        try {
            const data = await ingredientServices.getIngredients()
            setIngredients(data)
            if (data.length > 0) setSelectedIngredient(data[0]._id)
        } catch(err) {
            setError("Failed to load ingredients")
        } finally {
            setLoading(false)
        }
    }
    fetchIngredients()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedIngredient || !quantity) return
    try {
        await pantryServices.addPantryItem({
            ingredientId: selectedIngredient,
            quantity: Number(quantity)
        })
        setQuantity('')
        if (onItemAdded) onItemAdded()
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to add item')
    }
  }

  if (loading) {return <p>Loading Ingredients...</p>}

    return (
    <div className='form-container'>
        <h3>Add to Pantry</h3>
        {error && <p className='error-message'>{error}</p>}

        <form onSubmit={handleSubmit}>
            <div className='form-group'>
                <label>
                    Food:
                    <select value={selectedIngredient} onChange={(e) => setSelectedIngredient(e.target.value)}>
                        {ingredients.map(ingredient => (
                            <option key={ingredient._id} value={ingredient._id}>
                                {ingredient.name} ({ingredient.calories} kcal/100g)
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className='form-group'>
                <label>
                    Quantity (grams):
                    <input type='number' min="1" value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder='e.g. 500'
                    required/>
                </label>
            </div>
            <button type='submit'>Add Item</button>
        </form>
    </div>
  )
}

export default AddItemForm
