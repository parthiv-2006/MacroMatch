import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import ingredientServices from '../services/ingredientServices'
import pantryServices from '../services/pantryServices'


const AddItemForm = ({ onItemAdded }) => {
  const [ingredients, setIngredients] = useState([])
  const [selectedIngredient, setSelectedIngredient] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const fetchIngredients = async() => {
        try {
            const data = await ingredientServices.getIngredients()
            setIngredients(data)
        } catch(err) {
            setError("Failed to load ingredients")
        } finally {
            setLoading(false)
        }
    }
    fetchIngredients()
  }, [])

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedIngredient || !quantity) {
        setError('Please select a valid food item and quantity')
        return
    }
    try {
        await pantryServices.addPantryItem({
            ingredientId: selectedIngredient,
            quantity: Number(quantity)
        })
        setQuantity('')
        setSearchTerm('')
        setSelectedIngredient('')
        if (onItemAdded) onItemAdded()
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to add item')
    }
  }

  const handleSelectIngredient = (ingredient) => {
      setSelectedIngredient(ingredient._id)
      setSearchTerm(ingredient.name)
      setShowSuggestions(false)
      setError('')
  }

  if (loading) {return <p className="text-sm text-slate-500">Loading Ingredients...</p>}

    return (
    <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Add to Pantry</h3>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Food Item
                </label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setShowSuggestions(true)
                        setSelectedIngredient('')
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for food..."
                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border"
                    autoComplete="off"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && searchTerm && !selectedIngredient && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredIngredients.length > 0 ? (
                            filteredIngredients.map(ingredient => (
                                <div
                                    key={ingredient._id}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-50"
                                    onClick={() => handleSelectIngredient(ingredient)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-900 truncate">{ingredient.name}</span>
                                        <span className="text-xs text-slate-500 ml-2">{ingredient.calories} kcal/100g</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cursor-default select-none relative py-2 px-3 text-slate-700">
                                <p className="text-sm">No ingredients found.</p>
                                <button 
                                    type="button"
                                    onClick={() => navigate('/new-ingredient')} 
                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-xs mt-1 flex items-center"
                                >
                                    <span className="mr-1">+</span> Create "{searchTerm}"
                                </button>
                            </div>
                        )}
                    </div>
                )}
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
