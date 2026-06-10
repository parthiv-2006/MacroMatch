import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import solverServices from "../services/solverServices";
import pantryServices from "../services/pantryServices";
import recipeServices from "../services/recipeServices";
import ValidationError from "../components/ValidationError";
import ConfirmModal from "../components/ConfirmModal";
import PromptModal from "../components/PromptModal";
import { toast } from "react-toastify";

const GeneratorPage = ({ embedded = false }) => {
    const [formData, setFormData] = useState({ targetProtein: '', targetCarbs: '', targetFats: '', flavorProfile: 'savory' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [mealPlans, setMealPlans] = useState([])
    const [selectedMeals, setSelectedMeals] = useState([])
    const [consuming, setConsuming] = useState(false)
    const [reverseLoading, setReverseLoading] = useState(false)
    const [reverseResult, setReverseResult] = useState(null)
    const [activeTab, setActiveTab] = useState('meals')
    const [showConsumeModal, setShowConsumeModal] = useState(false)
    const [showRecipeModal, setShowRecipeModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const shoppingListRef = useRef(null)
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    const onChange = (e) => {
        setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }))
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    const setMacro = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const previewKcal = Math.round(
        (Number(formData.targetProtein) || 0) * 4 +
        (Number(formData.targetCarbs) || 0) * 4 +
        (Number(formData.targetFats) || 0) * 9
    )

    // Per-meal presets (roughly a third of common daily splits)
    const presets = [
        { id: 'cutting',  label: 'Cutting',  protein: 45, carbs: 30, fats: 12 },
        { id: 'balanced', label: 'Balanced', protein: 35, carbs: 55, fats: 18 },
        { id: 'bulking',  label: 'Bulking',  protein: 45, carbs: 80, fats: 25 },
        ...(user?.goals ? [{
            id: 'goals', label: 'My Goals ÷ 3',
            protein: Math.round((user.goals.protein || 0) / 3),
            carbs: Math.round((user.goals.carbs || 0) / 3),
            fats: Math.round((user.goals.fats || 0) / 3),
        }] : []),
    ]

    const applyPreset = (preset) => {
        setFormData(prev => ({
            ...prev,
            targetProtein: String(preset.protein),
            targetCarbs: String(preset.carbs),
            targetFats: String(preset.fats),
        }))
        setErrors({})
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        const newErrors = {}
        if (!formData.targetProtein) newErrors.targetProtein = 'Protein target is required'
        else if (Number(formData.targetProtein) <= 0) newErrors.targetProtein = 'Protein target must be greater than 0'
        if (!formData.targetCarbs) newErrors.targetCarbs = 'Carbs target is required'
        else if (Number(formData.targetCarbs) <= 0) newErrors.targetCarbs = 'Carbs target must be greater than 0'
        if (!formData.targetFats) newErrors.targetFats = 'Fats target is required'
        else if (Number(formData.targetFats) <= 0) newErrors.targetFats = 'Fats target must be greater than 0'
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
        setErrors({}); setLoading(true); setMealPlans([]); setSelectedMeals([]); setReverseResult(null); setActiveTab('meals')
        try {
            const response = await solverServices.generateMeal(formData)
            setMealPlans(response.mealPlans)
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to generate meal plan')
        } finally {
            setLoading(false)
        }
    }

    const onSubmitReverse = async (e) => {
        e.preventDefault()
        const newErrors = {}
        if (!formData.targetProtein) newErrors.targetProtein = 'Protein target is required'
        else if (Number(formData.targetProtein) <= 0) newErrors.targetProtein = 'Protein target must be greater than 0'
        if (!formData.targetCarbs) newErrors.targetCarbs = 'Carbs target is required'
        else if (Number(formData.targetCarbs) <= 0) newErrors.targetCarbs = 'Carbs target must be greater than 0'
        if (!formData.targetFats) newErrors.targetFats = 'Fats target is required'
        else if (Number(formData.targetFats) <= 0) newErrors.targetFats = 'Fats target must be greater than 0'
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
        setErrors({}); setReverseLoading(true); setReverseResult(null)
        try {
            const response = await solverServices.generateReverseMeal(formData)
            setReverseResult(response)
            setActiveTab('shopping')
            setTimeout(() => shoppingListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to generate shopping list')
        } finally {
            setReverseLoading(false)
        }
    }

    const toggleMealSelection = (index) => {
        if (selectedMeals.includes(index)) {
            setSelectedMeals(selectedMeals.filter(i => i !== index))
        } else {
            setSelectedMeals([...selectedMeals, index])
        }
    }

    const handleConsume = async () => {
        if (selectedMeals.length === 0) return
        const dontAsk = localStorage.getItem('dontAsk_consumeMeals')
        if (dontAsk === 'true') { executeConsume() } else { setShowConsumeModal(true) }
    }

    const executeConsume = async () => {
        setConsuming(true)
        try {
            const aggregatedIngredients = {}
            selectedMeals.forEach(index => {
                const plan = mealPlans[index]
                Object.entries(plan).forEach(([ingredient, amount]) => {
                    if (aggregatedIngredients[ingredient]) { aggregatedIngredients[ingredient] += amount }
                    else { aggregatedIngredients[ingredient] = amount }
                })
            })
            await pantryServices.consumePantryItems(aggregatedIngredients)
            toast.success("Meals consumed! Pantry updated.")
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to consume meals")
        } finally {
            setConsuming(false)
        }
    }

    const handleSaveRecipe = (e, plan) => {
        e.stopPropagation()
        setSelectedPlan(plan)
        setShowRecipeModal(true)
    }

    const executeSaveRecipe = async (name) => {
        if (!name || !selectedPlan) return
        try {
            await recipeServices.createRecipe({ name, ingredients: selectedPlan })
            toast.success("Recipe saved successfully!")
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save recipe")
        }
    }

    const inputStyle = (hasError) => ({
        width: '100%', padding: '9px 12px', fontSize: 13,
        background: 'var(--surface2)', border: `1px solid ${hasError ? 'var(--fat)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', color: 'var(--text)',
        fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
    })

    const macroFields = [
        { name: 'targetProtein', label: 'Protein', color: 'var(--protein)', placeholder: '30', max: 150 },
        { name: 'targetCarbs', label: 'Carbs', color: 'var(--carbs)', placeholder: '50', max: 250 },
        { name: 'targetFats', label: 'Fats', color: 'var(--fat)', placeholder: '15', max: 100 },
    ]

    return (
        <div style={{ fontFamily: 'var(--font)' }}>
            {/* Header */}
            {(!embedded || selectedMeals.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: embedded ? 20 : 32, flexWrap: 'wrap', gap: 16 }}>
                {!embedded && (
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Smart Engine</div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>Meal Generator</h1>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Enter your macro targets and let our algorithm build the perfect meal plan.</p>
                </div>
                )}
                {selectedMeals.length > 0 && (
                    <button
                        onClick={handleConsume}
                        disabled={consuming}
                        style={{
                            padding: '10px 20px', fontSize: 13, fontWeight: 700,
                            background: consuming ? 'var(--surface2)' : 'linear-gradient(135deg,#16a34a,#0d9488)',
                            border: 'none', borderRadius: 'var(--radius-sm)',
                            color: consuming ? 'var(--text-2)' : 'white',
                            cursor: consuming ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font)', boxShadow: consuming ? 'none' : '0 2px 8px rgba(22,163,74,.3)',
                            transition: 'opacity .15s', opacity: consuming ? .6 : 1,
                        }}
                        onMouseEnter={e => { if (!consuming) e.currentTarget.style.opacity = '.88' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                        {consuming ? 'Updating...' : `Consume Selected (${selectedMeals.length})`}
                    </button>
                )}
            </div>
            )}

            <div className="split-layout">
            {/* Config panel */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow)', position: 'sticky', top: 84 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Target Macros</p>
                <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Flavor Profile */}
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Flavor Profile</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['savory', 'sweet', 'neutral'].map((profile) => (
                                <button
                                    key={profile}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, flavorProfile: profile })}
                                    style={{
                                        flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: 700,
                                        background: formData.flavorProfile === profile ? 'var(--green-light)' : 'var(--surface2)',
                                        border: `1px solid ${formData.flavorProfile === profile ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-sm)',
                                        color: formData.flavorProfile === profile ? 'var(--green)' : 'var(--text-2)',
                                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                                    }}
                                >
                                    {profile.charAt(0).toUpperCase() + profile.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Presets */}
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Quick Presets <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(per meal)</span></p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {presets.map(preset => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    style={{
                                        padding: '6px 14px', fontSize: 12, fontWeight: 700,
                                        background: 'var(--surface2)', border: '1px solid var(--border)',
                                        borderRadius: 99, color: 'var(--text-2)',
                                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,.4)'; e.currentTarget.style.background = 'var(--green-light)' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)' }}
                                >
                                    {preset.label}
                                    <span style={{ marginLeft: 6, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-3)', fontWeight: 600 }}>
                                        {preset.protein}P·{preset.carbs}C·{preset.fats}F
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Macro Inputs with sliders */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        {macroFields.map(({ name, label, color, placeholder, max }) => (
                            <div key={name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color }}>{label}</label>
                                </div>
                                <div style={{ position: 'relative', marginBottom: 10 }}>
                                    <input
                                        type="number"
                                        name={name}
                                        value={formData[name]}
                                        onChange={onChange}
                                        placeholder={placeholder}
                                        style={{ ...inputStyle(!!errors[name]), paddingRight: 28, fontFamily: 'var(--mono)' }}
                                    />
                                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color, pointerEvents: 'none' }}>g</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={max}
                                    value={Number(formData[name]) || 0}
                                    onChange={e => setMacro(name, e.target.value)}
                                    style={{ color }}
                                />
                                <ValidationError show={!!errors[name]} message={errors[name]} />
                            </div>
                        ))}
                    </div>

                    {/* Live calorie preview */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', background: 'var(--cal-bg)',
                        border: '1px solid rgba(167,139,250,.25)', borderRadius: 'var(--radius-sm)',
                    }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                            Estimated meal energy
                            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>P×4 + C×4 + F×9</span>
                        </span>
                        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--cal)', letterSpacing: '-0.03em' }}>
                            {previewKcal} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>kcal</span>
                        </span>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '11px', fontSize: 13, fontWeight: 700,
                                background: loading ? 'var(--surface2)' : 'linear-gradient(135deg,#16a34a,#0d9488)',
                                border: 'none', borderRadius: 'var(--radius-sm)',
                                color: loading ? 'var(--text-2)' : 'white',
                                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)',
                                boxShadow: loading ? 'none' : '0 2px 8px rgba(22,163,74,.3)', transition: 'opacity .15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    Generating...
                                </>
                            ) : 'Generate from Pantry'}
                        </button>
                        <button
                            type="button"
                            onClick={onSubmitReverse}
                            disabled={reverseLoading}
                            style={{
                                width: '100%', padding: '11px', fontSize: 13, fontWeight: 700,
                                background: 'var(--surface2)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)', color: reverseLoading ? 'var(--text-3)' : 'var(--text-2)',
                                cursor: reverseLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                            }}
                            onMouseEnter={e => { if (!reverseLoading) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)' } }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                        >
                            {reverseLoading ? 'Building...' : 'Build Shopping List'}
                        </button>
                    </div>

                    <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <strong style={{ color: 'var(--text-2)' }}>Pantry Generator</strong> builds meals using only what you have. <strong style={{ color: 'var(--text-2)' }}>Shopping List Generator</strong> finds optimal recipes and tells you what to buy.
                    </p>
                </form>
            </div>

            {/* Results panel */}
            <div ref={shoppingListRef} style={{ minHeight: 420 }}>
                {(loading || reverseLoading) && mealPlans.length === 0 && !reverseResult ? (
                    <div style={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', gap: 16 }}>
                        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
                            {loading ? 'Solving for the optimal meal…' : 'Building your shopping list…'}
                        </p>
                    </div>
                ) : !(mealPlans.length > 0 || reverseResult) ? (
                    <div style={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px dashed var(--border-2)', borderRadius: 'var(--radius)', textAlign: 'center', padding: 24 }}>
                        <div style={{ width: 52, height: 52, background: 'var(--surface2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                                <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5z"/>
                            </svg>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Set your targets and generate</p>
                        <p style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 300, lineHeight: 1.6 }}>
                            Meal options that hit your exact macros will appear here, built from your pantry inventory.
                        </p>
                    </div>
                ) : (
                <>
                    {/* Tabs */}
                    {mealPlans.length > 0 && reverseResult && (
                        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
                            {[
                                { id: 'meals', label: `Meal Options (${mealPlans.length})`, activeColor: 'var(--green)' },
                                { id: 'shopping', label: 'Shopping List', activeColor: 'var(--carbs)' },
                            ].map(({ id, label, activeColor }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    style={{
                                        padding: '12px 20px', fontSize: 13, fontWeight: 700,
                                        background: 'none', border: 'none',
                                        borderBottom: `2px solid ${activeTab === id ? activeColor : 'transparent'}`,
                                        color: activeTab === id ? activeColor : 'var(--text-3)',
                                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                                        marginBottom: -1,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Meal Plans */}
                    {activeTab === 'meals' && mealPlans.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {mealPlans.map((plan, index) => {
                                const isSelected = selectedMeals.includes(index)
                                return (
                                    <div
                                        key={index}
                                        onClick={() => toggleMealSelection(index)}
                                        style={{
                                            background: 'var(--surface)', border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius)', boxShadow: isSelected ? '0 0 0 3px rgba(34,197,94,.1)' : 'var(--shadow)',
                                            display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer',
                                            transition: 'border-color .15s, box-shadow .15s',
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-2)' }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)' }}
                                    >
                                        {/* Card header */}
                                        <div style={{
                                            padding: '14px 16px', background: isSelected ? 'var(--green-light)' : 'var(--surface2)',
                                            borderBottom: `1px solid ${isSelected ? 'rgba(34,197,94,.2)' : 'var(--border)'}`,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? 'var(--green)' : 'var(--text)' }}>
                                                Recipe Option {index + 1}
                                            </span>
                                            <button
                                                onClick={(e) => handleSaveRecipe(e, plan)}
                                                title="Save as Recipe"
                                                style={{
                                                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'var(--surface)', border: '1px solid var(--border)',
                                                    borderRadius: 6, color: 'var(--text-3)', cursor: 'pointer', transition: 'all .1s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,.4)'; e.stopPropagation() }}
                                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Ingredients */}
                                        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            {Object.entries(plan).map(([ingredient, amount]) => (
                                                <div key={ingredient} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{ingredient}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>{amount}g</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Macro footer */}
                                        <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                                                {[
                                                    { label: 'PRO', val: formData.targetProtein, color: 'var(--protein)' },
                                                    { label: 'CRB', val: formData.targetCarbs, color: 'var(--carbs)' },
                                                    { label: 'FAT', val: formData.targetFats, color: 'var(--fat)' },
                                                ].map(({ label, val, color }, i) => (
                                                    <div key={label} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                                                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color, marginBottom: 2 }}>{label}</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{val}g</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {isSelected && (
                                                <div style={{ marginTop: 10, textAlign: 'center' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--green-light)', color: 'var(--green)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(34,197,94,.3)' }}>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        Ready to cook
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Shopping List Tab */}
                    {activeTab === 'shopping' && reverseResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Macro summary */}
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Target Summary</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                    {[
                                        { label: 'Protein', val: `${reverseResult.macros?.target?.protein}g`, color: 'var(--protein)' },
                                        { label: 'Carbs', val: `${reverseResult.macros?.target?.carbs}g`, color: 'var(--carbs)' },
                                        { label: 'Fats', val: `${reverseResult.macros?.target?.fats}g`, color: 'var(--fat)' },
                                        { label: 'Calories', val: reverseResult.macros?.achieved?.calories?.toFixed?.(0) || reverseResult.macros?.achieved?.calories, color: 'var(--cal)' },
                                    ].map(({ label, val, color }) => (
                                        <div key={label} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 6 }}>{label}</div>
                                            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.04em' }}>{val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {/* Optimum Recipe */}
                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)' }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', paddingBottom: 14, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>Optimum Recipe</p>
                                    {reverseResult.plan && Object.keys(reverseResult.plan).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            {Object.entries(reverseResult.plan).map(([name, grams]) => (
                                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{name}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', fontFamily: 'var(--mono)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 4 }}>{grams}g</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No ingredients selected.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Shopping List */}
                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Missing Ingredients</p>
                                        {reverseResult.shoppingList?.length > 0 && (
                                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--carbs)', background: 'var(--carbs-bg)', border: '1px solid rgba(245,158,11,.25)', padding: '3px 8px', borderRadius: 99 }}>
                                                Buy {reverseResult.shoppingList.length} items
                                            </span>
                                        )}
                                    </div>
                                    {reverseResult.shoppingList?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            {reverseResult.shoppingList.map(item => (
                                                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--carbs)', flexShrink: 0 }} />
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.name}</span>
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--carbs)', fontFamily: 'var(--mono)', background: 'var(--carbs-bg)', border: '1px solid rgba(245,158,11,.25)', padding: '3px 8px', borderRadius: 4 }}>{Math.round(item.amount)}g</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>You have everything!</p>
                                            <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>Your pantry covers this entire recipe.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pantry Usage Table */}
                            {reverseResult.pantryUsage?.length > 0 && (
                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)' }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Pantry Usage Breakdown</p>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                                                    {['Ingredient', 'Recipe Needs', 'In Stock', 'Missing'].map((h, i) => (
                                                        <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reverseResult.pantryUsage.map(row => (
                                                    <tr key={row.name} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.name}</td>
                                                        <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textAlign: 'right', fontFamily: 'var(--mono)' }}>{Math.round(row.needed)}g</td>
                                                        <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textAlign: 'right', fontFamily: 'var(--mono)' }}>{Math.round(row.fromPantry)}g</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                            {row.shortfall > 0 ? (
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--carbs)', fontFamily: 'var(--mono)', background: 'var(--carbs-bg)', border: '1px solid rgba(245,158,11,.25)', padding: '3px 8px', borderRadius: 4 }}>{Math.round(row.shortfall)}g</span>
                                                            ) : (
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)', padding: '3px 8px', borderRadius: 4 }}>✓</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
                )}
            </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={showConsumeModal}
                onClose={() => setShowConsumeModal(false)}
                onConfirm={executeConsume}
                title="Consume Meals"
                message={`Are you sure you want to log ${selectedMeals.length} meal(s)? This will permanently remove the ingredients from your pantry inventory.`}
                confirmText="Consume Meals"
                showDontAskAgain={true}
                dontAskAgainKey="consumeMeals"
            />

            <PromptModal
                isOpen={showRecipeModal}
                onClose={() => { setShowRecipeModal(false); setSelectedPlan(null) }}
                onSubmit={executeSaveRecipe}
                title="Save Recipe"
                message="Enter a name for this custom recipe:"
                placeholder="e.g. My Protein Bowl"
            />
        </div>
    )
}

export default GeneratorPage
