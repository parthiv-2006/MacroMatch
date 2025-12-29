import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pantryServices from '../services/pantryServices'
import { toast } from 'react-toastify'

const History = () => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
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
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="mr-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Meal History</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Track your past meals and nutritional intake.
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-6">
                        {history.map((log) => (
                            <div key={log._id} className="bg-white shadow rounded-lg overflow-hidden border border-slate-100">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-100 p-2 rounded-full mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-slate-700">{formatDate(log.date)}</span>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {log.items.length} item{log.items.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    {/* Macros Summary */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Calories</div>
                                            <div className="font-bold text-slate-900 text-lg">{Math.round(log.totalMacros.calories)}</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Protein</div>
                                            <div className="font-bold text-emerald-600 text-lg">{Math.round(log.totalMacros.protein)}g</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Carbs</div>
                                            <div className="font-bold text-blue-600 text-lg">{Math.round(log.totalMacros.carbs)}g</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Fats</div>
                                            <div className="font-bold text-amber-600 text-lg">{Math.round(log.totalMacros.fats)}g</div>
                                        </div>
                                    </div>

                                    {/* Ingredients List */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-900 mb-3">Ingredients Consumed</h4>
                                        <ul className="divide-y divide-slate-100 border-t border-slate-100">
                                            {log.items.map((item, index) => (
                                                <li key={index} className="py-3 flex justify-between items-center text-sm">
                                                    <span className="text-slate-700">{item.ingredientName}</span>
                                                    <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs">
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
                    <div className="text-center py-20 bg-white rounded-lg shadow border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-900">No Meal History</h3>
                        <p className="mt-1 text-slate-500">You haven't tracked any meals yet.</p>
                        <button 
                            onClick={() => navigate('/generate')}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Generate a Meal
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default History