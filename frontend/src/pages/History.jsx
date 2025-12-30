import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pantryServices from '../services/pantryServices'
import recipeServices from '../services/recipeServices'
import ConfirmModal from '../components/ConfirmModal'
import PromptModal from '../components/PromptModal'
import { toast } from 'react-toastify'

const History = () => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showSaveRecipeModal, setShowSaveRecipeModal] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await pantryServices.getMealHistory()
                setHistory(data)
            } catch (err) {
                toast.error('Failed to load meal history')
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [])

    const handleDeleteLog = async (id) => {
        const dontAsk = localStorage.getItem('dontAsk_deleteMeal')
        if (dontAsk === 'true') {
            executeDeleteLog(id)
        } else {
            setSelectedLog({ _id: id })
            setShowDeleteModal(true)
        }
    }

    const executeDeleteLog = async (id) => {
        const logId = id || selectedLog?._id
        try {
            await pantryServices.deleteMealLog(logId)
            setHistory(prev => prev.filter(log => log._id !== logId))
            toast.success('Meal removed from history')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete meal')
        }
    }

    const handleSaveRecipe = async (log) => {
        setSelectedLog(log)
        setShowSaveRecipeModal(true)
    }

    const executeSaveRecipe = async (name) => {
        if (!name || !selectedLog) return

        try {
            // Transform ingredients array to object { "Name": Amount } expected by backend
            const ingredientsObj = {}
            selectedLog.items.forEach(item => {
                ingredientsObj[item.ingredientName] = item.amount
            })

            const recipeData = {
                name,
                ingredients: ingredientsObj
            }
            
            await recipeServices.createRecipe(recipeData)
            toast.success('Recipe saved successfully!')
        } catch (err) {
            console.error(err)
            toast.error('Failed to save recipe')
        }
    }

    const formatDate = (dateString) => {
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
        return new Date(dateString).toLocaleDateString('en-US', options)
    }

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="mr-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Meal History</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Track your past meals and nutritional intake.
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-6">
                        {history.map((log) => (
                            <div key={log._id} className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/10 transition-all duration-200 hover:shadow-xl hover:bg-white/10">
                                <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-500/20 p-2 rounded-full mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-white">{formatDate(log.date)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                                            {log.items.length} item{log.items.length !== 1 ? 's' : ''}
                                        </div>
                                        <button
                                            onClick={() => handleSaveRecipe(log)}
                                            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20"
                                            title="Save as Recipe"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                            Save
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLog(log._id)}
                                            className="text-sm text-rose-400 hover:text-rose-300 font-medium flex items-center transition-colors bg-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-500/20"
                                            title="Delete from history"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0h8l-.867 12.142A2 2 0 0113.138 21H10.86a2 2 0 01-1.995-1.858L8 7z" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    {/* Macros Summary */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Calories</div>
                                            <div className="font-bold text-white text-lg">{Math.round(log.totalMacros.calories)}</div>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Protein</div>
                                            <div className="font-bold text-emerald-400 text-lg">{Math.round(log.totalMacros.protein)}g</div>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Carbs</div>
                                            <div className="font-bold text-blue-400 text-lg">{Math.round(log.totalMacros.carbs)}g</div>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Fats</div>
                                            <div className="font-bold text-amber-400 text-lg">{Math.round(log.totalMacros.fats)}g</div>
                                        </div>
                                    </div>

                                    {/* Ingredients List */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-3">Ingredients Consumed</h4>
                                        <ul className="divide-y divide-white/10 border-t border-white/10">
                                            {log.items.map((item, index) => (
                                                <li key={index} className="py-3 flex justify-between items-center text-sm">
                                                    <span className="text-slate-200 font-medium">{item.ingredientName}</span>
                                                    <span className="text-slate-300 bg-white/10 px-2.5 py-1 rounded-md text-xs font-medium">
                                                        {item.amount}g
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-lg rounded-xl shadow-sm border border-white/10">
                        <div className="bg-white/5 p-4 rounded-full inline-block mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white">No Meal History</h3>
                        <p className="mt-1 text-slate-400">You haven't tracked any meals yet.</p>
                        <button 
                            onClick={() => navigate('/generate')}
                            className="mt-6 inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                        >
                            Generate a Meal
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedLog(null)
                }}
                onConfirm={() => executeDeleteLog()}
                title="Delete Meal"
                message="Are you sure you want to delete this meal from history?"
                confirmText="Delete"
                showDontAskAgain={true}
                dontAskAgainKey="deleteMeal"
            />

            <PromptModal
                isOpen={showSaveRecipeModal}
                onClose={() => {
                    setShowSaveRecipeModal(false)
                    setSelectedLog(null)
                }}
                onSubmit={executeSaveRecipe}
                title="Save as Recipe"
                message="Enter a name for this recipe:"
                placeholder="e.g. My Favorite Meal"
                defaultValue={selectedLog ? `Meal from ${new Date(selectedLog.date).toLocaleDateString()}` : ''}
            />
        </div>
    )
}

export default History