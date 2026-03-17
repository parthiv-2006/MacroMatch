import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import recipeServices from '../services/recipeServices'
import pantryServices from '../services/pantryServices'
import ConfirmModal from '../components/ConfirmModal'
import { toast } from 'react-toastify'

const Recipes = () => {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [consuming, setConsuming] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showCookModal, setShowCookModal] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState(null)
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
        const dontAsk = localStorage.getItem('dontAsk_deleteRecipe')
        if (dontAsk === 'true') {
            executeDelete(id)
        } else {
            setSelectedRecipe({ _id: id })
            setShowDeleteModal(true)
        }
    }

    const executeDelete = async (id) => {
        const recipeId = id || selectedRecipe?._id
        try {
            await recipeServices.deleteRecipe(recipeId)
            setRecipes(recipes.filter(r => r._id !== recipeId))
            toast.success("Recipe deleted")
        } catch (err) {
            toast.error("Failed to delete recipe")
        }
    }

    const handleCook = async (recipe) => {
        const dontAsk = localStorage.getItem('dontAsk_cookRecipe')
        if (dontAsk === 'true') {
            executeCook(recipe)
        } else {
            setSelectedRecipe(recipe)
            setShowCookModal(true)
        }
    }
    
    const executeCook = async (recipe) => {
        const recipeData = recipe || selectedRecipe
        setConsuming(true)
        try {
            // Convert recipe ingredients array back to object format expected by consumePantryItems
            const ingredientsToConsume = {}
            recipeData.ingredients.forEach(item => {
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
        <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen font-inter">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-soft-xl border border-slate-100 ring-1 ring-slate-200/50">
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate('/')}
                            className="mr-5 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all duration-200 border border-slate-200 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Cookbook</p>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Recipes</h1>
                            <p className="mt-1.5 text-sm text-slate-500 font-medium">
                                Your saved meal combinations ready to be cooked.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/generate')}
                        className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl shadow-soft-md shadow-brand-500/20 text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 active:scale-[0.98]"
                    >
                        Create New Recipe
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    </div>
                ) : recipes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {recipes.map((recipe) => (
                            <div key={recipe._id} className="bg-white shadow-soft-xl rounded-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-200/50 flex flex-col transition-all duration-300 hover:shadow-soft-2xl hover:-translate-y-1 group">
                                <div className="bg-gradient-to-br from-slate-50 to-white px-6 py-5 border-b border-slate-100 flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-4">
                                        {editingId === recipe._id ? (
                                            <div className="flex flex-col space-y-3">
                                                <input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onBlur={() => saveEditingName(recipe)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEditingName(recipe)
                                                        if (e.key === 'Escape') cancelEditingName()
                                                    }}
                                                    className="w-full text-lg font-black text-slate-900 bg-white border-2 border-brand-500 rounded-lg px-3 py-2 focus:outline-none shadow-sm"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveEditingName(recipe)}
                                                        className="flex-1 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEditingName}
                                                        className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEditingName(recipe)}
                                                className="text-left w-full text-xl font-black text-slate-900 hover:text-brand-600 transition-colors tracking-tight leading-tight"
                                                title="Click to rename"
                                            >
                                                {recipe.name}
                                                <div className="h-1 w-12 bg-emerald-500 mt-3 rounded-full opacity-50 group-hover:w-full group-hover:opacity-100 transition-all duration-300"></div>
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(recipe._id)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6 shadow-inner">
                                        <span className="text-slate-800 text-base">{Math.round(recipe.totalMacros.calories)} <span className="text-[10px] text-slate-500 uppercase tracking-widest">Kcal</span></span>
                                        <div className="flex gap-3 text-[11px] tracking-widest">
                                            <span className="text-emerald-700">P:{Math.round(recipe.totalMacros.protein)}g</span>
                                            <span className="text-blue-700">C:{Math.round(recipe.totalMacros.carbs)}g</span>
                                            <span className="text-amber-700">F:{Math.round(recipe.totalMacros.fats)}g</span>
                                        </div>
                                    </div>

                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">Ingredients</div>
                                    <ul className="space-y-3 flex-1 mb-6">
                                        {recipe.ingredients.slice(0, 4).map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-700 font-bold truncate pr-4">{item.name}</span>
                                                <span className="text-slate-800 font-black bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-md text-xs tabular-nums">{item.amount}g</span>
                                            </li>
                                        ))}
                                        {recipe.ingredients.length > 4 && (
                                            <li className="text-[11px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 text-center py-2 rounded-lg mt-2">
                                                +{recipe.ingredients.length - 4} more ingredients
                                            </li>
                                        )}
                                    </ul>

                                    <button
                                        onClick={() => handleCook(recipe)}
                                        disabled={consuming}
                                        className="w-full flex justify-center items-center px-4 py-3.5 border-2 border-brand-500 text-sm font-bold rounded-xl text-brand-600 hover:bg-brand-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 mt-auto shadow-sm tracking-wide"
                                    >
                                        {consuming ? 'Cooking...' : 'Cook Recipe'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-2xl shadow-soft-xl border border-slate-100 ring-1 ring-slate-200/50">
                        <div className="bg-slate-50 p-6 rounded-3xl inline-block mb-6 shadow-sm border border-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Saved Recipes</h3>
                        <p className="mt-2 text-slate-500 font-medium">Generate a meal plan and save it to your cookbook.</p>
                        <button 
                            onClick={() => navigate('/generate')}
                            className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-sm font-bold rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200"
                        >
                            Go to Generator
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedRecipe(null)
                }}
                onConfirm={() => executeDelete()}
                title="Delete Recipe"
                message="Are you sure you want to delete this recipe from your cookbook? This action cannot be undone."
                confirmText="Delete Recipe"
                showDontAskAgain={true}
                dontAskAgainKey="deleteRecipe"
            />

            <ConfirmModal
                isOpen={showCookModal}
                onClose={() => {
                    setShowCookModal(false)
                    setSelectedRecipe(null)
                }}
                onConfirm={() => executeCook()}
                title="Cook Recipe"
                message={`Ready to cook "${selectedRecipe?.name}"? Generating this meal will permanently deduct the required ingredients from your pantry inventory.`}
                confirmText="Cook Recipe"
                showDontAskAgain={true}
                dontAskAgainKey="cookRecipe"
            />
        </div>
    )
}

export default Recipes