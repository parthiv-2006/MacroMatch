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

        if (!selectedIngredient) newErrors.ingredient = 'Please select a food item'
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

    if (loading) return (
        <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Loading ingredients...</p>
    )

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '9px 12px',
        fontSize: 13,
        background: 'var(--surface2)',
        border: `1px solid ${hasError ? 'var(--fat)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text)',
        fontFamily: 'var(--font)',
        outline: 'none',
        boxSizing: 'border-box',
    })

    const labelStyle = {
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: 'var(--text-3)',
        marginBottom: 6,
    }

    return (
        <div>
            {errors.general && (
                <div style={{ background: 'var(--fat-bg)', border: '1px solid var(--fat)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 16, fontSize: 13, color: 'var(--fat)', fontWeight: 500 }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Food Item search */}
                <div style={{ position: 'relative' }}>
                    <label style={labelStyle}>Food Item</label>
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
                        autoComplete="off"
                        style={inputStyle(!!errors.ingredient)}
                    />
                    <ValidationError show={!!errors.ingredient} message={errors.ingredient} />

                    {showSuggestions && searchTerm && !selectedIngredient && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 20,
                            marginTop: 4,
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: 'var(--shadow-md)',
                            maxHeight: 220,
                            overflowY: 'auto',
                        }}>
                            {filteredIngredients.length > 0 ? (
                                filteredIngredients.map(ingredient => (
                                    <div
                                        key={ingredient._id}
                                        onClick={() => handleSelectIngredient(ingredient)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '9px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background .1s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ingredient.name}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{ingredient.calories} kcal</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginBottom: 10 }}>No ingredients found.</p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/ingredient')}
                                        style={{
                                            fontSize: 12, fontWeight: 700, color: 'var(--green)',
                                            background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)',
                                            borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                                            cursor: 'pointer', fontFamily: 'var(--font)',
                                        }}
                                    >
                                        + Create "{searchTerm}"
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quantity */}
                <div>
                    <label style={labelStyle}>Quantity (grams)</label>
                    <input
                        type="number"
                        min="1"
                        placeholder="e.g. 100"
                        value={quantity}
                        onChange={(e) => {
                            setQuantity(e.target.value)
                            if (errors.quantity) setErrors({ ...errors, quantity: '' })
                        }}
                        style={inputStyle(!!errors.quantity)}
                    />
                    <ValidationError show={!!errors.quantity} message={errors.quantity} />
                </div>

                {/* Threshold */}
                <div>
                    <label style={labelStyle}>Low-stock threshold (grams)</label>
                    <input
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        style={inputStyle(false)}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, fontWeight: 500 }}>
                        Alert when below this amount (default: 100g)
                    </p>
                </div>

                <button
                    type="submit"
                    style={{
                        marginTop: 4,
                        width: '100%',
                        padding: '10px',
                        background: 'linear-gradient(135deg,#16a34a,#0d9488)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 13,
                        fontFamily: 'var(--font)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(22,163,74,.3)',
                        transition: 'opacity .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                    Add to Pantry
                </button>
            </form>
        </div>
    )
}

export default AddItemForm
