import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pantryServices from '../services/pantryServices'
import recipeServices from '../services/recipeServices'
import ConfirmModal from '../components/ConfirmModal'
import PromptModal from '../components/PromptModal'
import { toast } from 'react-toastify'
import { Clock, BookMarked, Trash2, ChevronLeft, Calendar } from 'lucide-react'

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
        <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
                {/* Header */}
                <div className="mb-10 flex items-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="mr-5 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 transition-all duration-200 border border-slate-200 shadow-sm"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Meal History</h1>
                        <p className="mt-1.5 text-sm font-medium text-slate-500">
                            Track your past meals and nutritional intake.
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-8">
                        {history.map((log) => (
                            <div key={log._id} className="bg-white shadow-soft-xl rounded-2xl flex flex-col border border-slate-100 ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-soft-2xl hover:-translate-y-1 overflow-hidden group">
                                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl mr-4 border border-emerald-100/50 shadow-sm">
                                            <Clock size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className="font-bold text-slate-800 text-lg">{formatDate(log.date)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm font-bold text-slate-500 bg-white border border-slate-200 shadow-sm px-3.5 py-1.5 rounded-xl flex items-center">
                                            {log.items.length} item{log.items.length !== 1 ? 's' : ''}
                                        </div>
                                        <button
                                            onClick={() => handleSaveRecipe(log)}
                                            className="text-sm text-emerald-700 hover:text-emerald-800 font-bold flex items-center transition-all bg-emerald-50 px-4 py-2.5 rounded-xl hover:bg-emerald-100 active:scale-[0.98] border border-emerald-100/50 shadow-sm"
                                            title="Save as Recipe"
                                        >
                                            <BookMarked size={16} strokeWidth={2.5} className="mr-2" />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLog(log._id)}
                                            className="text-sm text-rose-600 hover:text-rose-700 font-bold flex items-center transition-all bg-rose-50 px-4 py-2.5 rounded-xl hover:bg-rose-100 active:scale-[0.98] border border-rose-100/50 shadow-sm"
                                            title="Delete from history"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} className="mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    {/* Macros Summary */}
                                    <div className="grid grid-cols-4 gap-6 mb-8">
                                        <div className="text-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Calories</div>
                                            <div className="font-black text-slate-800 text-3xl tracking-tight">{Math.round(log.totalMacros.calories)}</div>
                                        </div>
                                        <div className="text-center p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 shadow-sm">
                                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Protein</div>
                                            <div className="font-black text-emerald-600 text-3xl tracking-tight">{Math.round(log.totalMacros.protein)}g</div>
                                        </div>
                                        <div className="text-center p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-sm">
                                            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Carbs</div>
                                            <div className="font-black text-blue-600 text-3xl tracking-tight">{Math.round(log.totalMacros.carbs)}g</div>
                                        </div>
                                        <div className="text-center p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 shadow-sm">
                                            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Fats</div>
                                            <div className="font-black text-amber-500 text-3xl tracking-tight">{Math.round(log.totalMacros.fats)}g</div>
                                        </div>
                                    </div>

                                    {/* Ingredients List */}
                                    <div className="pt-2">
                                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                                            Ingredients Consumed
                                        </h4>
                                        <div className="space-y-2">
                                            {log.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center text-sm py-2.5 border-b-2 border-slate-50 last:border-0 group-hover:border-slate-100 transition-colors">
                                                    <span className="text-slate-600 font-bold">{item.ingredientName}</span>
                                                    <span className="text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                        {item.amount}g
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-soft-xl border border-slate-100 ring-1 ring-slate-200/50">
                        <div className="bg-slate-50 p-4 rounded-2xl inline-block mb-5 border border-slate-100 shadow-sm">
                            <Calendar className="h-8 w-8 text-slate-400" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Meal History</h3>
                        <p className="mt-2 text-slate-500 font-medium">You haven't tracked any meals yet.</p>
                        <button 
                            onClick={() => navigate('/generate')}
                            className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-soft-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 active:scale-[0.98]"
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