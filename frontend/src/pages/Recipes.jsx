import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import recipeServices from '../services/recipeServices'
import pantryServices from '../services/pantryServices'
import { toast } from 'react-toastify'

const Recipes = () => {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [consuming, setConsuming] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await recipeServices.getRecipes()
                setRecipes(data)
            } catch (err) {
                toast.error('Failed to load recipes')
            } finally {
                setLoading(false)
            }
        }

        fetchRecipes()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recipe?")) return
        try {
            await recipeServices.deleteRecipe(id)
            setRecipes(recipes.filter(r => r._id !== id))
            toast.success("Recipe deleted")
        } catch (err) {
            toast.error("Failed to delete recipe")
        }
    }

    const handleCook = async (recipe) => {
        if (!window.confirm(`Cook "${recipe.name}"? This will remove items from your pantry.`)) return
        
        setConsuming(true)
        try {
            // Convert recipe ingredients array back to object format expected by consumePantryItems
            const ingredientsToConsume = {}
            recipe.ingredients.forEach(item => {
                ingredientsToConsume[item.name] = item.amount
            })

            await pantryServices.consumePantryItems(ingredientsToConsume)
            toast.success("Bon Appétit! Pantry updated.")
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cook recipe")
        } finally {
            setConsuming(false)
        }
    }

    const startEditingName = (recipe) => {
        setEditingId(recipe._id)
        setEditingName(recipe.name)
    }

    const cancelEditingName = () => {
        setEditingId(null)
        setEditingName('')
    }

    const saveEditingName = async (recipe) => {
        const trimmed = editingName.trim()
        if (!trimmed) {
            toast.error('Name cannot be empty')
            return
        }
        try {
            const updated = await recipeServices.updateRecipe(recipe._id, { name: trimmed })
            setRecipes(prev => prev.map(r => r._id === recipe._id ? updated : r))
            setEditingId(null)
            setEditingName('')
            toast.success('Recipe renamed')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to rename recipe')
        }
    }

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate('/')}
                            className="mr-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">My Recipes</h1>
                            <p className="mt-2 text-sm text-slate-400">
                                Your saved meal combinations.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/generate')}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                    >
                        Create New
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : recipes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {recipes.map((recipe) => (
                            <div key={recipe._id} className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/10 flex flex-col transition-all duration-200 hover:shadow-xl hover:bg-white/10">
                                <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                        {editingId === recipe._id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onBlur={() => saveEditingName(recipe)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEditingName(recipe)
                                                        if (e.key === 'Escape') cancelEditingName()
                                                    }}
                                                    className="w-full text-lg font-semibold text-white bg-white/10 border border-emerald-500/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => saveEditingName(recipe)}
                                                    className="p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full transition"
                                                    title="Save name"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={cancelEditingName}
                                                    className="p-2 text-slate-400 hover:text-slate-300 bg-white/10 hover:bg-white/20 rounded-full transition"
                                                    title="Cancel"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEditingName(recipe)}
                                                className="text-left w-full text-lg font-semibold text-white truncate hover:text-emerald-400 transition"
                                                title="Click to rename"
                                            >
                                                {recipe.name}
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(recipe._id)}
                                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-full transition-all duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between text-sm text-slate-400 mb-4 bg-white/5 p-2 rounded-lg">
                                        <span className="font-medium text-white">{Math.round(recipe.totalMacros.calories)} kcal</span>
                                        <span>P: {Math.round(recipe.totalMacros.protein)}g</span>
                                        <span>C: {Math.round(recipe.totalMacros.carbs)}g</span>
                                        <span>F: {Math.round(recipe.totalMacros.fats)}g</span>
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        {recipe.ingredients.slice(0, 3).map((item, idx) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-200 truncate font-medium">{item.name}</span>
                                                <span className="text-slate-300 bg-white/10 px-2 py-0.5 rounded text-xs">{item.amount}g</span>
                                            </li>
                                        ))}
                                        {recipe.ingredients.length > 3 && (
                                            <li className="text-xs text-slate-500 italic pl-1">
                                                + {recipe.ingredients.length - 3} more ingredients
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-white/5 px-6 py-4 border-t border-white/10">
                                    <button
                                        onClick={() => handleCook(recipe)}
                                        disabled={consuming}
                                        className="w-full flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                                    >
                                        {consuming ? 'Cooking...' : 'Cook Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-lg rounded-xl shadow-sm border border-white/10">
                        <div className="bg-white/5 p-4 rounded-full inline-block mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white">No Saved Recipes</h3>
                        <p className="mt-1 text-slate-400">Generate a meal plan and save it to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Recipes