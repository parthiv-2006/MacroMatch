import { useState, useEffect, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import pantryServices from '../services/pantryServices'
import recipeServices from '../services/recipeServices'
import ConfirmModal from '../components/ConfirmModal'
import PromptModal from '../components/PromptModal'
import { toast } from 'react-toastify'
import MacroPill from '../components/ui/MacroPill'

const History = () => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showSaveRecipeModal, setShowSaveRecipeModal] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const calorieGoal = user?.goals?.calories || 2200

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
            const ingredientsObj = {}
            selectedLog.items.forEach(item => { ingredientsObj[item.ingredientName] = item.amount })
            await recipeServices.createRecipe({ name, ingredients: ingredientsObj })
            toast.success('Recipe saved successfully!')
        } catch (err) {
            toast.error('Failed to save recipe')
        }
    }

    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    })

    const formatDayHeading = (date) => {
        const today = new Date()
        const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
        const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
        if (sameDay(date, today)) return 'Today'
        if (sameDay(date, yesterday)) return 'Yesterday'
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    }

    // Group logs by calendar day (newest first) with summed macros per day
    const groupedByDay = useMemo(() => {
        const groups = new Map()
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))
        sorted.forEach(log => {
            const d = new Date(log.date)
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
            if (!groups.has(key)) {
                groups.set(key, { date: d, logs: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } })
            }
            const group = groups.get(key)
            group.logs.push(log)
            const m = log.totalMacros || {}
            group.totals.calories += m.calories || 0
            group.totals.protein += m.protein || 0
            group.totals.carbs += m.carbs || 0
            group.totals.fats += m.fats || 0
        })
        return Array.from(groups.values())
    }, [history])

    const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', fontFamily: 'var(--font)' }
    const actionBtn = (color, bg, hoverColor, hoverBg) => ({
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', fontSize: 12, fontWeight: 700,
        color, background: bg, border: `1px solid ${bg}`,
        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
        fontFamily: 'var(--font)', transition: 'all .15s',
    })

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Tracking</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>Meal History</h1>
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Track your past meals and nutritional intake.</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {groupedByDay.map((group) => (
                        <div key={group.date.toISOString()}>
                            {/* Day header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
                                        {formatDayHeading(group.date)}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
                                        {group.logs.length} meal{group.logs.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 700, color: group.totals.calories > calorieGoal ? 'var(--warn)' : 'var(--cal)', background: 'var(--cal-bg)', border: '1px solid rgba(167,139,250,.25)', padding: '3px 10px', borderRadius: 99 }}>
                                        {Math.round(group.totals.calories)} / {calorieGoal} kcal
                                    </span>
                                    <MacroPill type="protein" value={Math.round(group.totals.protein)} compact />
                                    <MacroPill type="carbs" value={Math.round(group.totals.carbs)} compact />
                                    <MacroPill type="fat" value={Math.round(group.totals.fats)} compact />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {group.logs.map((log) => (
                        <div key={log._id} style={card}>
                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{formatTime(log.date)}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 99 }}>
                                        {log.items.length} item{log.items.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={() => handleSaveRecipe(log)}
                                        style={actionBtn('var(--green)', 'var(--green-light)', 'var(--green)', 'rgba(34,197,94,.2)')}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,.2)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--green-light)' }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                                        Save
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLog(log._id)}
                                        style={actionBtn('var(--fat)', 'var(--fat-bg)', 'var(--fat)', 'rgba(248,113,113,.2)')}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,.2)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--fat-bg)' }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Card body */}
                            <div style={{ padding: '20px 20px' }}>
                                {/* Macro summary */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                                    {[
                                        { label: 'Calories', val: Math.round(log.totalMacros.calories), unit: 'kcal', color: 'var(--cal)' },
                                        { label: 'Protein', val: Math.round(log.totalMacros.protein), unit: 'g', color: 'var(--protein)' },
                                        { label: 'Carbs', val: Math.round(log.totalMacros.carbs), unit: 'g', color: 'var(--carbs)' },
                                        { label: 'Fats', val: Math.round(log.totalMacros.fats), unit: 'g', color: 'var(--fat)' },
                                    ].map(({ label, val, unit, color }) => (
                                        <div key={label} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 6 }}>{label}</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.04em' }}>{val}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{unit}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 10 }}>Ingredients Consumed</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                        {log.items.map((item, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.ingredientName}</span>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', fontFamily: 'var(--mono)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 4 }}>
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
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, background: 'var(--surface2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
                        </svg>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No Meal History</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>You haven't tracked any meals yet.</p>
                    <button
                        onClick={() => navigate('/generate')}
                        style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#16a34a,#0d9488)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: '0 2px 8px rgba(22,163,74,.3)', transition: 'opacity .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                        Generate a Meal
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedLog(null) }}
                onConfirm={() => executeDeleteLog()}
                title="Delete Meal"
                message="Are you sure you want to delete this meal from history?"
                confirmText="Delete"
                showDontAskAgain={true}
                dontAskAgainKey="deleteMeal"
            />

            <PromptModal
                isOpen={showSaveRecipeModal}
                onClose={() => { setShowSaveRecipeModal(false); setSelectedLog(null) }}
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
