import ingredientServices from "../services/ingredientServices"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "react-toastify"
import ValidationError from "../components/ValidationError"
import ConfirmModal from "../components/ConfirmModal"
import MacroBar from "../components/ui/MacroBar"

function CreateIngredient({ embedded = false }) {
    const navigate = useNavigate()
    const [ingredient, setIngredient] = useState({
        name: '', calories: '', protein: '', carbs: '', fats: '', servingSize: 100
    })
    const [errors, setErrors] = useState({})
    const [showCalorieWarning, setShowCalorieWarning] = useState(false)
    const [calculatedCals, setCalculatedCals] = useState(0)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setIngredient({ ...ingredient, [e.target.name]: e.target.value })
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = {}
        if (!ingredient.name.trim()) newErrors.name = 'Food name is required'
        if (!ingredient.calories) newErrors.calories = 'Calories are required'
        else if (Number(ingredient.calories) <= 0) newErrors.calories = 'Calories must be greater than 0'
        if (!ingredient.protein) newErrors.protein = 'Protein is required'
        else if (Number(ingredient.protein) < 0) newErrors.protein = 'Protein cannot be negative'
        if (!ingredient.carbs) newErrors.carbs = 'Carbs are required'
        else if (Number(ingredient.carbs) < 0) newErrors.carbs = 'Carbs cannot be negative'
        if (!ingredient.fats) newErrors.fats = 'Fats are required'
        else if (Number(ingredient.fats) < 0) newErrors.fats = 'Fats cannot be negative'
        if (!ingredient.servingSize) newErrors.servingSize = 'Serving size is required'
        else if (Number(ingredient.servingSize) <= 0) newErrors.servingSize = 'Serving size must be greater than 0'

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

        const { calories, protein, carbs, fats } = ingredient
        const calcCals = (Number(protein) * 4) + (Number(carbs) * 4) + (Number(fats) * 9)

        if (Math.abs(Number(calories) - calcCals) > (Number(calories) * 0.2)) {
            const dontAsk = localStorage.getItem('dontAsk_calorieWarning')
            if (dontAsk === 'true') { saveIngredient() } else { setCalculatedCals(Math.round(calcCals)); setShowCalorieWarning(true) }
            return
        }
        saveIngredient()
    }

    const saveIngredient = async () => {
        setLoading(true)
        setShowCalorieWarning(false)
        try {
            await ingredientServices.createIngredient({
                name: ingredient.name,
                calories: Number(ingredient.calories),
                protein: Number(ingredient.protein),
                carbs: Number(ingredient.carbs),
                fats: Number(ingredient.fats),
                servingSize: Number(ingredient.servingSize)
            })
            toast.success('Ingredient Created!')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create ingredient')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = (hasError) => ({
        width: '100%', padding: '9px 12px', fontSize: 13,
        background: 'var(--surface2)', border: `1px solid ${hasError ? 'var(--fat)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', color: 'var(--text)',
        fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
    })

    const labelStyle = {
        display: 'block', fontSize: 11, fontWeight: 700,
        letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--text-3)', marginBottom: 6,
    }

    const macroFields = [
        { name: 'protein', label: 'Protein', color: 'var(--protein)', bg: 'var(--protein-bg)' },
        { name: 'carbs', label: 'Carbs', color: 'var(--carbs)', bg: 'var(--carbs-bg)' },
        { name: 'fats', label: 'Fats', color: 'var(--fat)', bg: 'var(--fat-bg)' },
    ]

    return (
        <div>
            {/* Header */}
            {!embedded && (
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Database</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>Add New Food</h1>
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Add a custom ingredient to your personal database.</p>
            </div>
            )}

            <div className="split-layout-wide">
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px 28px', boxShadow: 'var(--shadow)', fontFamily: 'var(--font)' }}>
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Name */}
                    <div>
                        <label style={labelStyle}>Food Name</label>
                        <input
                            name="name"
                            value={ingredient.name}
                            onChange={handleChange}
                            placeholder="e.g. Greek Yogurt, Protein Powder"
                            style={inputStyle(!!errors.name)}
                        />
                        <ValidationError show={!!errors.name} message={errors.name} />
                    </div>

                    {/* Serving size + Calories */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '16px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div>
                            <label style={labelStyle}>Serving Size</label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="servingSize" value={ingredient.servingSize} onChange={handleChange} style={{ ...inputStyle(!!errors.servingSize), paddingRight: 32 }} />
                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, pointerEvents: 'none' }}>g</span>
                            </div>
                            <ValidationError show={!!errors.servingSize} message={errors.servingSize} />
                            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Standard serving size</p>
                        </div>
                        <div>
                            <label style={labelStyle}>Calories</label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="calories" value={ingredient.calories} onChange={handleChange} style={{ ...inputStyle(!!errors.calories), paddingRight: 44 }} />
                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', fontWeight: 700, pointerEvents: 'none' }}>kcal</span>
                            </div>
                            <ValidationError show={!!errors.calories} message={errors.calories} />
                            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Total calories per serving</p>
                        </div>
                    </div>

                    {/* Macros */}
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                            Macronutrients <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>(per serving)</span>
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {macroFields.map(({ name, label, color, bg }) => (
                                <div key={name} style={{ padding: '12px', background: bg, borderRadius: 'var(--radius-sm)', border: `1px solid ${bg}` }}>
                                    <label style={{ ...labelStyle, color }}>{label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            name={name}
                                            value={ingredient[name]}
                                            onChange={handleChange}
                                            style={{ ...inputStyle(!!errors[name]), background: 'var(--surface)', paddingRight: 28 }}
                                        />
                                        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color, pointerEvents: 'none' }}>g</span>
                                    </div>
                                    <ValidationError show={!!errors[name]} message={errors[name]} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '11px', fontSize: 13, fontWeight: 700,
                                background: loading ? 'var(--surface2)' : 'linear-gradient(135deg,#16a34a,#0d9488)',
                                border: 'none', borderRadius: 'var(--radius-sm)',
                                color: loading ? 'var(--text-2)' : 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font)',
                                boxShadow: loading ? 'none' : '0 2px 8px rgba(22,163,74,.3)',
                                transition: 'opacity .15s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            {loading ? 'Saving...' : 'Save Custom Ingredient'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Live nutrition preview */}
            <div style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(() => {
                    const p = Number(ingredient.protein) || 0
                    const c = Number(ingredient.carbs) || 0
                    const f = Number(ingredient.fats) || 0
                    const entered = Number(ingredient.calories) || 0
                    const computed = Math.round(p * 4 + c * 4 + f * 9)
                    const total = p + c + f
                    const mismatch = entered > 0 && computed > 0 && Math.abs(entered - computed) > entered * 0.2
                    const pctOf = (kcal) => computed > 0 ? Math.round((kcal / computed) * 100) : 0
                    return (
                        <>
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow)' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
                                    Nutrition Preview <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>· per {Number(ingredient.servingSize) || 100}g serving</span>
                                </p>

                                {total === 0 && entered === 0 ? (
                                    <div style={{ padding: '36px 16px', textAlign: 'center', border: '1px dashed var(--border-2)', borderRadius: 'var(--radius-sm)' }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>Nothing to preview yet</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Fill in the macros to see a live breakdown.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                                            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--cal)', letterSpacing: '-0.04em' }}>{entered || computed}</span>
                                            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>kcal</span>
                                        </div>

                                        <div style={{ marginBottom: 18 }}>
                                            <MacroBar protein={p} carbs={c} fat={f} size="md" />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            {[
                                                { label: 'Protein', grams: p, kcal: p * 4, color: 'var(--protein)' },
                                                { label: 'Carbs', grams: c, kcal: c * 4, color: 'var(--carbs)' },
                                                { label: 'Fats', grams: f, kcal: f * 9, color: 'var(--fat)' },
                                            ].map(({ label, grams, kcal, color }) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
                                                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
                                                        {label}
                                                    </span>
                                                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>
                                                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{grams}g</span>
                                                        <span style={{ color: 'var(--text-3)', marginLeft: 10 }}>{pctOf(kcal)}% of kcal</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {mismatch && (
                                            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--warn)', fontWeight: 600, lineHeight: 1.5 }}>
                                                Your macros sum to ~{computed} kcal but you entered {entered} kcal. Double-check the label.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>How this is used</p>
                                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>
                                    The meal solver treats every ingredient as scalable per gram, so accurate per-serving values here directly improve how precisely generated meals hit your macro targets.
                                </p>
                            </div>
                        </>
                    )
                })()}
            </div>
            </div>

            <ConfirmModal
                isOpen={showCalorieWarning}
                onClose={() => setShowCalorieWarning(false)}
                onConfirm={saveIngredient}
                title="Calorie Mismatch Warning"
                message={`Your macros sum to approximately ${calculatedCals} kcal, but you entered ${ingredient.calories} kcal. Do you want to continue anyway?`}
                confirmText="Continue Anyway"
                showDontAskAgain={true}
                dontAskAgainKey="calorieWarning"
            />
        </div>
    )
}

export default CreateIngredient
