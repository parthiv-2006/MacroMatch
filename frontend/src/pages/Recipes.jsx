import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import recipeServices from '../services/recipeServices'
import pantryServices from '../services/pantryServices'
import ConfirmModal from '../components/ConfirmModal'
import MacroBar from '../components/ui/MacroBar'
import MacroPill from '../components/ui/MacroPill'
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
        if (dontAsk === 'true') { executeDelete(id) } else { setSelectedRecipe({ _id: id }); setShowDeleteModal(true) }
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
        if (dontAsk === 'true') { executeCook(recipe) } else { setSelectedRecipe(recipe); setShowCookModal(true) }
    }

    const executeCook = async (recipe) => {
        const recipeData = recipe || selectedRecipe
        setConsuming(true)
        try {
            const ingredientsToConsume = {}
            recipeData.ingredients.forEach(item => { ingredientsToConsume[item.name] = item.amount })
            await pantryServices.consumePantryItems(ingredientsToConsume)
            toast.success("Bon Appétit! Pantry updated.")
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cook recipe")
        } finally {
            setConsuming(false)
        }
    }

    const startEditingName = (recipe) => { setEditingId(recipe._id); setEditingName(recipe.name) }
    const cancelEditingName = () => { setEditingId(null); setEditingName('') }

    const saveEditingName = async (recipe) => {
        const trimmed = editingName.trim()
        if (!trimmed) { toast.error('Name cannot be empty'); return }
        try {
            const updated = await recipeServices.updateRecipe(recipe._id, { name: trimmed })
            setRecipes(prev => prev.map(r => r._id === recipe._id ? updated : r))
            setEditingId(null); setEditingName('')
            toast.success('Recipe renamed')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to rename recipe')
        }
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Cookbook</div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>My Recipes</h1>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Your saved meal combinations ready to be cooked.</p>
                </div>
                <button
                    onClick={() => navigate('/generate')}
                    style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#16a34a,#0d9488)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: '0 2px 8px rgba(22,163,74,.3)', transition: 'opacity .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                    + Create New Recipe
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : recipes.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {recipes.map((recipe) => (
                        <div
                            key={recipe._id}
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font)', transition: 'border-color .15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            {/* Card header */}
                            <div style={{ padding: '16px 18px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {editingId === recipe._id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <input
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                onBlur={() => saveEditingName(recipe)}
                                                onKeyDown={e => { if (e.key === 'Enter') saveEditingName(recipe); if (e.key === 'Escape') cancelEditingName() }}
                                                autoFocus
                                                style={{ width: '100%', padding: '7px 10px', fontSize: 14, fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => saveEditingName(recipe)} style={{ flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 700, background: 'var(--green)', border: 'none', borderRadius: 4, color: 'white', cursor: 'pointer', fontFamily: 'var(--font)' }}>Save</button>
                                                <button onClick={cancelEditingName} style={{ flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startEditingName(recipe)}
                                            title="Click to rename"
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                                        >
                                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.name}</span>
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(recipe._id)}
                                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-3)', cursor: 'pointer', flexShrink: 0, transition: 'all .1s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--fat)'; e.currentTarget.style.borderColor = 'var(--fat)'; e.currentTarget.style.background = 'var(--fat-bg)' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                                </button>
                            </div>

                            {/* Card body */}
                            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* Macro summary */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <div>
                                        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--cal)' }}>{Math.round(recipe.totalMacros.calories)}</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>kcal</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <MacroPill type="protein" value={Math.round(recipe.totalMacros.protein)} compact />
                                        <MacroPill type="carbs" value={Math.round(recipe.totalMacros.carbs)} compact />
                                        <MacroPill type="fat" value={Math.round(recipe.totalMacros.fats)} compact />
                                    </div>
                                </div>

                                {/* Macro bar */}
                                <MacroBar protein={recipe.totalMacros.protein} carbs={recipe.totalMacros.carbs} fat={recipe.totalMacros.fats} size="sm" />

                                {/* Ingredients */}
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 8 }}>Ingredients</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                        {recipe.ingredients.slice(0, 4).map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{item.name}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{item.amount}g</span>
                                            </div>
                                        ))}
                                        {recipe.ingredients.length > 4 && (
                                            <div style={{ padding: '8px 0', fontSize: 11, fontWeight: 700, color: 'var(--green)', textAlign: 'center' }}>
                                                +{recipe.ingredients.length - 4} more ingredients
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cook button */}
                            <div style={{ padding: '0 18px 18px' }}>
                                <button
                                    onClick={() => handleCook(recipe)}
                                    disabled={consuming}
                                    style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, background: 'transparent', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', color: 'var(--green)', cursor: consuming ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', transition: 'all .15s', opacity: consuming ? .6 : 1 }}
                                    onMouseEnter={e => { if (!consuming) { e.currentTarget.style.background = 'var(--green-light)' } }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                >
                                    {consuming ? 'Cooking...' : 'Cook Recipe'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, background: 'var(--surface2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No Saved Recipes</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>Generate a meal plan and save it to your cookbook.</p>
                    <button
                        onClick={() => navigate('/generate')}
                        style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                        Go to Generator
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedRecipe(null) }}
                onConfirm={() => executeDelete()}
                title="Delete Recipe"
                message="Are you sure you want to delete this recipe from your cookbook? This action cannot be undone."
                confirmText="Delete Recipe"
                showDontAskAgain={true}
                dontAskAgainKey="deleteRecipe"
            />

            <ConfirmModal
                isOpen={showCookModal}
                onClose={() => { setShowCookModal(false); setSelectedRecipe(null) }}
                onConfirm={() => executeCook()}
                title="Cook Recipe"
                message={`Ready to cook "${selectedRecipe?.name}"? This will permanently deduct the required ingredients from your pantry inventory.`}
                confirmText="Cook Recipe"
                showDontAskAgain={true}
                dontAskAgainKey="cookRecipe"
            />
        </div>
    )
}

export default Recipes
