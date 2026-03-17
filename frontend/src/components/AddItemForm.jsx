import { useState, useEffect } from 'react'
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
        const fetchIngredients = async () => {
            try {
                const data = await ingredientServices.getIngredients()
                setIngredients(data)
            } catch (err) {
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

    if (loading) { return <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Ingredients...</p> }

    return (
        <div>
            {errors.general && <p className="text-sm text-red-600 mb-5 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">{errors.general}</p>}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
                        className="block w-full pl-4 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-xl transition-all duration-200 shadow-sm font-medium"
                        autoComplete="off"
                        style={{
                            borderColor: errors.ingredient ? '#ef4444' : undefined,
                            boxShadow: errors.ingredient ? '0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                        }}
                    />
                    <ValidationError show={!!errors.ingredient} message={errors.ingredient} />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchTerm && !selectedIngredient && (
                        <div className="absolute z-20 mt-2 w-full bg-white shadow-soft-xl max-h-60 rounded-xl py-2 text-sm ring-1 ring-slate-200 overflow-auto focus:outline-none border border-slate-100">
                            {filteredIngredients.length > 0 ? (
                                filteredIngredients.map(ingredient => (
                                    <div
                                        key={ingredient._id}
                                        className="cursor-pointer select-none relative py-2.5 pl-4 pr-4 hover:bg-slate-50 transition-colors"
                                        onClick={() => handleSelectIngredient(ingredient)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-800 truncate">{ingredient.name}</span>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md tabular-nums">{ingredient.calories} kcal</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="cursor-default select-none relative py-4 px-4 text-center text-slate-500">
                                    <p className="text-sm font-medium">No ingredients found.</p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/ingredient')}
                                        className="text-emerald-600 hover:text-emerald-700 font-bold text-sm mt-3 inline-flex items-center hover:underline bg-emerald-50 px-4 py-2 rounded-lg transition-colors border border-emerald-100"
                                    >
                                        <span className="mr-1 shadow-sm px-1.5 py-0.5 bg-white rounded-md text-emerald-600">+</span> Create "{searchTerm}"
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all duration-200 font-medium"
                        style={{
                            borderColor: errors.quantity ? '#ef4444' : undefined,
                            boxShadow: errors.quantity ? '0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                        }}
                    />
                    <ValidationError show={!!errors.quantity} message={errors.quantity} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Low-stock threshold (grams)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all duration-200 font-medium"
                    />
                    <p className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide">We will flag this item when it drops below this amount (default: 100g).</p>
                </div>

                <div className="pt-2">
                  <button
                      type="submit"
                      className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 active:scale-[0.98] shadow-emerald-500/20"
                  >
                      Add to Pantry
                  </button>
                </div>
            </form>
        </div>
    )
}

export default AddItemForm
