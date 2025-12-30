import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import ingredientServices from '../services/ingredientServices'
import pantryServices from '../services/pantryServices'
import ValidationError from './ValidationError'


const AddItemForm = ({ onItemAdded }) => {
  const [ingredients, setIngredients] = useState([])
  const [selectedIngredient, setSelectedIngredient] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
    const [quantity, setQuantity] = useState('')
    const [threshold, setThreshold] = useState('100')
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const fetchIngredients = async() => {
        try {
            const data = await ingredientServices.getIngredients()
            setIngredients(data)
        } catch(err) {
            setErrors({ general: "Failed to load ingredients" })
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
    const newErrors = {}
    
    if (!selectedIngredient) {
      newErrors.ingredient = 'Please select a food item'
    }
    
    if (!quantity) {
      newErrors.quantity = 'Quantity is required'
    } else if (Number(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    try {
        await pantryServices.addPantryItem({
            ingredientId: selectedIngredient,
            quantity: Number(quantity),
            threshold: threshold ? Number(threshold) : undefined
        })
        setQuantity('')
        setThreshold('100')
        setSearchTerm('')
        setSelectedIngredient('')
        if (onItemAdded) onItemAdded()
    } catch (err) {
        setErrors({ general: err.response?.data?.message || 'Failed to add item' })
    }
  }

  const handleSelectIngredient = (ingredient) => {
      setSelectedIngredient(ingredient._id)
      setSearchTerm(ingredient.name)
      setShowSuggestions(false)
      if (errors.ingredient) setErrors({ ...errors, ingredient: '' })
  }

  if (loading) {return <p className="text-sm text-slate-500">Loading Ingredients...</p>}

    return (
    <div>
        <h3 className="text-lg font-semibold text-white mb-6">Add to Pantry</h3>
        {errors.general && <p className="text-sm text-red-200 mb-4 bg-red-500/10 p-2 rounded border border-red-500/20">{errors.general}</p>}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
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
                    className="block w-full pl-4 pr-10 py-2.5 text-base bg-white/5 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:text-sm rounded-xl transition-all duration-200 shadow-sm"
                    autoComplete="off"
                    style={{
                        borderColor: errors.ingredient ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: errors.ingredient ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                    }}
                />
                <ValidationError show={!!errors.ingredient} message={errors.ingredient} />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && searchTerm && !selectedIngredient && (
                    <div className="absolute z-10 mt-1 w-full bg-[#0f1c2f] shadow-xl max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-white/10">
                        {filteredIngredients.length > 0 ? (
                            filteredIngredients.map(ingredient => (
                                <div
                                    key={ingredient._id}
                                    className="cursor-pointer select-none relative py-2.5 pl-4 pr-9 hover:bg-white/5 transition-colors"
                                    onClick={() => handleSelectIngredient(ingredient)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-white truncate">{ingredient.name}</span>
                                        <span className="text-xs text-slate-400 ml-2 bg-white/10 px-2 py-0.5 rounded-full">{ingredient.calories} kcal</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cursor-default select-none relative py-3 px-4 text-slate-400">
                                <p className="text-sm text-slate-400">No ingredients found.</p>
                                <button 
                                    type="button"
                                    onClick={() => navigate('/new-ingredient')} 
                                    className="text-emerald-400 hover:text-emerald-300 font-medium text-sm mt-2 flex items-center hover:underline"
                                >
                                    <span className="mr-1">+</span> Create "{searchTerm}"
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Quantity (grams)
                </label>
                <input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 100"
                    value={quantity}
                    onChange={(e) => {
                        setQuantity(e.target.value)
                        if (errors.quantity) setErrors({ ...errors, quantity: '' })
                    }}
                    className="appearance-none block w-full px-4 py-2.5 bg-white/5 border rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:text-sm transition-all duration-200"
                    style={{
                        borderColor: errors.quantity ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: errors.quantity ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                    }}
                />
                <ValidationError show={!!errors.quantity} message={errors.quantity} />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Low-stock threshold (grams)
                </label>
                <input
                    type="number"
                    min="0"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all duration-200"
                />
                <p className="mt-1 text-xs text-slate-400">We will flag this item when it drops below this amount. Default: 100g.</p>
            </div>

            <button 
                type="submit" 
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
                Add Item
            </button>
        </form>
    </div>
  )
}

export default AddItemForm
