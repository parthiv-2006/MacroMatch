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

  if (loading) {return <p className="text-sm text-slate-500">Loading Ingredients...</p>}

    return (
    <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Add to Pantry</h3>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Food Item
                </label>
                <select 
                    value={selectedIngredient} 
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border"
                >
                    {ingredients.map(ingredient => (
                        <option key={ingredient._id} value={ingredient._id}>
                            {ingredient.name} ({ingredient.calories} kcal/100g)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity (grams)
                </label>
                <input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
            </div>

            <button 
                type="submit" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
                Add Item
            </button>
        </form>
    </div>
  )
}

export default AddItemForm
