import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import authService from '../services/authServices'

const activityLevels = [
  { id: 1.2,   label: 'Sedentary',   desc: 'Little or no exercise' },
  { id: 1.375, label: 'Light',       desc: '1–3 workouts / week' },
  { id: 1.55,  label: 'Moderate',    desc: '3–5 workouts / week' },
  { id: 1.725, label: 'Active',      desc: '6–7 workouts / week' },
]

const goalAdjustments = [
  { id: 'cut',      label: 'Lose Fat',  delta: -400 },
  { id: 'maintain', label: 'Maintain',  delta: 0 },
  { id: 'bulk',     label: 'Build Muscle', delta: 300 },
]

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  background: 'var(--surface2)', border: '1px solid var(--border-2)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text)',
  fontFamily: 'var(--mono)', outline: 'none', boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  letterSpacing: '.08em', textTransform: 'uppercase',
  color: 'var(--text-3)', marginBottom: 6,
}

// Mifflin-St Jeor BMR → TDEE → macro split (protein 1.8 g/kg, fat 25% kcal, carbs remainder)
const computeTargets = ({ sex, age, weight, height, activity, adjustment }) => {
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161)
  const calories = Math.round(bmr * activity + adjustment)
  const protein = Math.round(weight * 1.8)
  const fats = Math.round((calories * 0.25) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4))
  return { calories, protein, carbs, fats }
}

const GoalsModal = ({ isOpen, onClose, goals, onSaved }) => {
  const [tab, setTab] = useState('manual')
  const [form, setForm] = useState({ calories: '', protein: '', carbs: '', fats: '' })
  const [calc, setCalc] = useState({ sex: 'male', age: 25, weight: 75, height: 178, activity: 1.55, adjustment: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && goals) {
      setForm({
        calories: goals.calories ?? '',
        protein: goals.protein ?? '',
        carbs: goals.carbs ?? '',
        fats: goals.fats ?? '',
      })
    }
  }, [isOpen, goals])

  const suggestion = useMemo(() => computeTargets(calc), [calc])

  if (!isOpen) return null

  const macroKcal = (Number(form.protein) || 0) * 4 + (Number(form.carbs) || 0) * 4 + (Number(form.fats) || 0) * 9

  const handleSave = async () => {
    const payload = {
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fats: Number(form.fats),
    }
    if (Object.values(payload).some(v => Number.isNaN(v) || v < 0)) {
      toast.error('All targets must be non-negative numbers')
      return
    }
    setSaving(true)
    try {
      const { goals: saved } = await authService.updateGoals(payload)
      toast.success('Daily targets updated')
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save targets')
    } finally {
      setSaving(false)
    }
  }

  const applySuggestion = () => {
    setForm({ ...suggestion })
    setTab('manual')
    toast.info('Suggested targets applied — review and save')
  }

  const macroFields = [
    { key: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--cal)' },
    { key: 'protein',  label: 'Protein',  unit: 'g',    color: 'var(--protein)' },
    { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: 'var(--carbs)' },
    { key: 'fats',     label: 'Fats',     unit: 'g',    color: 'var(--fat)' },
  ]

  const segBtn = (active) => ({
    flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: 700,
    background: active ? 'var(--green-light)' : 'var(--surface2)',
    border: `1px solid ${active ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)',
    color: active ? 'var(--green)' : 'var(--text-2)',
    cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
          fontFamily: 'var(--font)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 2 }}>Nutrition</div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Daily Targets</h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Tab switch */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={segBtn(tab === 'manual')} onClick={() => setTab('manual')}>Set Manually</button>
            <button style={segBtn(tab === 'calculator')} onClick={() => setTab('calculator')}>Calculate for Me</button>
          </div>

          {tab === 'manual' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {macroFields.map(({ key, label, unit, color }) => (
                  <div key={key}>
                    <label style={{ ...labelStyle, color }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="0"
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={{ ...inputStyle, paddingRight: 42 }}
                      />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', pointerEvents: 'none' }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consistency hint */}
              <div style={{ padding: '10px 14px', background: 'var(--cal-bg)', border: '1px solid rgba(167,139,250,.25)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-2)' }}>
                Your macros add up to{' '}
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--cal)' }}>{macroKcal} kcal</span>
                {Number(form.calories) > 0 && Math.abs(macroKcal - Number(form.calories)) > Number(form.calories) * 0.1 && (
                  <span style={{ color: 'var(--warn)', fontWeight: 600 }}> — that differs from your calorie target by more than 10%.</span>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', padding: '11px', fontSize: 13, fontWeight: 700,
                  background: saving ? 'var(--surface2)' : 'linear-gradient(135deg,#16a34a,#0d9488)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  color: saving ? 'var(--text-2)' : 'white',
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)',
                  boxShadow: saving ? 'none' : '0 2px 8px rgba(22,163,74,.3)',
                }}
              >
                {saving ? 'Saving…' : 'Save Targets'}
              </button>
            </>
          ) : (
            <>
              {/* Calculator inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Sex</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['male', 'female'].map(s => (
                      <button key={s} style={segBtn(calc.sex === s)} onClick={() => setCalc({ ...calc, sex: s })}>
                        {s === 'male' ? 'Male' : 'Female'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input type="number" min="13" max="100" value={calc.age} onChange={e => setCalc({ ...calc, age: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input type="number" min="30" max="300" value={calc.weight} onChange={e => setCalc({ ...calc, weight: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Height (cm)</label>
                  <input type="number" min="100" max="250" value={calc.height} onChange={e => setCalc({ ...calc, height: Number(e.target.value) })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Activity Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {activityLevels.map(({ id, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => setCalc({ ...calc, activity: id })}
                      style={{ ...segBtn(calc.activity === id), textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      <span>{label}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Goal</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {goalAdjustments.map(({ id, label, delta }) => (
                    <button key={id} style={segBtn(calc.adjustment === delta)} onClick={() => setCalc({ ...calc, adjustment: delta })}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestion preview */}
              <div style={{ padding: '16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Suggested Daily Targets</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'kcal', val: suggestion.calories, color: 'var(--cal)' },
                    { label: 'Protein', val: `${suggestion.protein}g`, color: 'var(--protein)' },
                    { label: 'Carbs', val: `${suggestion.carbs}g`, color: 'var(--carbs)' },
                    { label: 'Fats', val: `${suggestion.fats}g`, color: 'var(--fat)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.03em' }}>{val}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.5 }}>
                  Mifflin-St Jeor BMR × activity, protein at 1.8 g/kg, fat at 25% of calories, carbs filling the remainder.
                </p>
              </div>

              <button
                onClick={applySuggestion}
                style={{
                  width: '100%', padding: '11px', fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg,#16a34a,#0d9488)',
                  border: 'none', borderRadius: 'var(--radius-sm)', color: 'white',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  boxShadow: '0 2px 8px rgba(22,163,74,.3)',
                }}
              >
                Use These Targets
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoalsModal
