import { useEffect, useMemo, useState, useContext } from 'react'
import {
  Area, AreaChart, CartesianGrid, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from 'recharts'
import pantryServices from '../services/pantryServices'
import authService from '../services/authServices'
import AuthContext from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import RingChart from '../components/ui/RingChart'
import GoalsModal from '../components/GoalsModal'

const DEFAULT_GOALS = { calories: 2200, protein: 140, carbs: 220, fats: 70 }

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// Consecutive days with at least one logged meal, counting back from today (or yesterday)
const computeStreak = (history) => {
  const dayKeys = new Set(history.map(log => {
    const d = new Date(log.date)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))
  let streak = 0
  const cursor = new Date()
  const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  if (!dayKeys.has(keyOf(cursor))) cursor.setDate(cursor.getDate() - 1) // today not logged yet — don't break the streak
  while (dayKeys.has(keyOf(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

const categoryLabels = {
  protein: 'Protein Sources', carb: 'Grains & Carbs', fat: 'Fats & Oils',
  vegetable: 'Vegetables', fruit: 'Fruits', dairy: 'Dairy', spice: 'Spices', other: 'Other'
}

const categoryColors = {
  protein: '#3b82f6', carb: '#f59e0b', fat: '#f87171',
  vegetable: '#22c55e', fruit: '#ec4899', dairy: '#a78bfa', spice: '#f97316', other: '#4a5568'
}

const formatDayLabel = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)

const buildMacroSeries = (history, days) => {
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))

  const byDay = new Map()
  history.forEach((log) => {
    const parsed = new Date(log.date)
    parsed.setHours(0, 0, 0, 0)
    if (parsed < cutoff) return
    const key = parsed.toISOString()
    const existing = byDay.get(key) || { protein: 0, carbs: 0, fats: 0, calories: 0 }
    const macros = log.totalMacros || {}
    byDay.set(key, {
      protein: existing.protein + (macros.protein || 0),
      carbs: existing.carbs + (macros.carbs || 0),
      fats: existing.fats + (macros.fats || 0),
      calories: existing.calories + (macros.calories || 0)
    })
  })

  const data = []
  for (let i = 0; i < days; i++) {
    const current = new Date(cutoff)
    current.setDate(cutoff.getDate() + i)
    const entry = byDay.get(current.toISOString()) || { protein: 0, carbs: 0, fats: 0, calories: 0 }
    data.push({
      date: formatDayLabel(current),
      protein: Math.round(entry.protein),
      carbs: Math.round(entry.carbs),
      fats: Math.round(entry.fats),
      calories: Math.round(entry.calories)
    })
  }
  return data
}

const buildInventoryBreakdown = (pantryItems) => {
  const totals = {}
  let grandTotal = 0
  pantryItems.forEach((item) => {
    const category = item.ingredient?.category || 'other'
    const quantity = item.quantity || 0
    totals[category] = (totals[category] || 0) + quantity
    grandTotal += quantity
  })
  return Object.entries(totals).map(([key, value]) => ({
    key, name: categoryLabels[key] || key, value,
    percent: grandTotal ? Math.round((value / grandTotal) * 100) : 0
  }))
}

const MacroTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null
  const p = payload.find(i => i.dataKey === 'protein')
  const c = payload.find(i => i.dataKey === 'carbs')
  const f = payload.find(i => i.dataKey === 'fats')
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', minWidth: 180, fontFamily: 'var(--font)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[{ label: 'Protein', val: p?.value, color: 'var(--protein)' }, { label: 'Carbs', val: c?.value, color: 'var(--carbs)' }, { label: 'Fats', val: f?.value, color: 'var(--fat)' }].map(({ label: l, val, color }) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{val || 0}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const InventoryTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const { name, value, percent } = payload[0].payload
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontFamily: 'var(--font)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)' }}><span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', fontWeight: 700 }}>{Math.round(value)}g</span> · <span style={{ color: 'var(--green)', fontWeight: 700 }}>{percent}%</span></div>
    </div>
  )
}

const chartStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '24px 24px', boxShadow: 'var(--shadow)',
}

const EmptyChart = ({ icon, title, sub }) => (
  <div style={{ height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '1px dashed var(--border-2)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ width: 44, height: 44, background: 'var(--surface)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</p>
    <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{sub}</p>
  </div>
)

const AnalyticsDashboard = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [history, setHistory] = useState([])
  const [pantryItems, setPantryItems] = useState([])
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showGoalsModal, setShowGoalsModal] = useState(false)

  const goals = { ...DEFAULT_GOALS, ...(user?.goals || {}) }

  useEffect(() => {
    const load = async () => {
      try {
        const [historyData, pantryData] = await Promise.all([
          pantryServices.getMealHistory(),
          pantryServices.getPantryItems()
        ])
        setHistory(historyData || [])
        setPantryItems(pantryData || [])
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()

    // Refresh goals from the server — older sessions won't have them cached
    authService.getProfile()
      .then(profile => { if (profile?.goals) updateUser({ goals: profile.goals }) })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const todayTotals = useMemo(() => {
    const now = new Date()
    return history.reduce((acc, log) => {
      if (!isSameDay(new Date(log.date), now)) return acc
      const m = log.totalMacros || {}
      return {
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fats: acc.fats + (m.fats || 0),
        meals: acc.meals + 1,
      }
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 })
  }, [history])

  const streak = useMemo(() => computeStreak(history), [history])

  const macroData = useMemo(() => buildMacroSeries(history, range === '7d' ? 7 : 30), [history, range])
  const inventoryData = useMemo(() => buildInventoryBreakdown(pantryItems), [pantryItems])

  const totalCalories = macroData.reduce((sum, day) => sum + (day.calories || 0), 0)
  const avgProtein = macroData.length ? Math.round(macroData.reduce((sum, day) => sum + (day.protein || 0), 0) / macroData.length) : 0
  const bestProteinDay = macroData.reduce((best, day) => (day.protein > (best?.protein || 0) ? day : best), null)

  const hasMacroData = macroData.some(d => d.protein || d.carbs || d.fats)
  const hasInventoryData = inventoryData.length > 0 && inventoryData.some(d => d.value > 0)

  const rangeBtn = (val, label) => (
    <button
      onClick={() => setRange(val)}
      style={{
        padding: '6px 16px', fontSize: 13, fontWeight: 600,
        background: range === val ? 'var(--surface2)' : 'transparent',
        border: range === val ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: 'var(--radius-sm)', color: range === val ? 'var(--text)' : 'var(--text-2)',
        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
      }}
      onMouseEnter={e => { if (range !== val) e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { if (range !== val) e.currentTarget.style.color = 'var(--text-2)' }}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Data Visualization</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Track macronutrient trends and pantry inventory distribution.</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
          {rangeBtn('7d', 'Last 7 days')}
          {rangeBtn('30d', 'Last 30 days')}
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--fat-bg)', border: '1px solid var(--fat)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--fat)', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Today's Progress */}
          <div style={{ ...chartStyle, padding: '28px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Today's Progress</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                  {todayTotals.meals > 0
                    ? `${todayTotals.meals} meal${todayTotals.meals !== 1 ? 's' : ''} logged today`
                    : 'Nothing logged yet today'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {streak > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--carbs)', background: 'var(--carbs-bg)', border: '1px solid rgba(245,158,11,.25)', padding: '5px 12px', borderRadius: 99 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
                    {streak}-day streak
                  </span>
                )}
                <button
                  onClick={() => setShowGoalsModal(true)}
                  style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 'var(--radius-sm)', padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--green-light)' }}
                >
                  Edit Targets
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 36, alignItems: 'center' }}>
              {/* Calorie ring */}
              <RingChart value={todayTotals.calories} max={goals.calories} size={170} strokeWidth={12} color="var(--cal)">
                <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {Math.round(todayTotals.calories)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontWeight: 600 }}>of {goals.calories} kcal</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 6, color: todayTotals.calories > goals.calories ? 'var(--warn)' : 'var(--green)' }}>
                  {todayTotals.calories > goals.calories
                    ? `${Math.round(todayTotals.calories - goals.calories)} over`
                    : `${Math.round(goals.calories - todayTotals.calories)} left`}
                </div>
              </RingChart>

              {/* Macro progress bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { label: 'Protein', val: todayTotals.protein, target: goals.protein, color: 'var(--protein)', bg: 'var(--protein-bg)' },
                  { label: 'Carbs', val: todayTotals.carbs, target: goals.carbs, color: 'var(--carbs)', bg: 'var(--carbs-bg)' },
                  { label: 'Fats', val: todayTotals.fats, target: goals.fats, color: 'var(--fat)', bg: 'var(--fat-bg)' },
                ].map(({ label, val, target, color, bg }) => {
                  const pct = target > 0 ? Math.min((val / target) * 100, 100) : 0
                  const over = val > target
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>
                          <span style={{ color: 'var(--text)', fontWeight: 700 }}>{Math.round(val)}</span>
                          {' / '}{target}g
                          <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: over ? 'var(--warn)' : 'var(--text-3)' }}>
                            {over ? `+${Math.round(val - target)}g` : `${Math.round(target - val)}g left`}
                          </span>
                        </span>
                      </div>
                      <div style={{ height: 8, background: bg, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: over ? 'var(--warn)' : color, borderRadius: 99, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard label="Total Calories" value={Math.round(totalCalories)} unit="kcal" sub={range === '7d' ? 'Last 7 days' : 'Last 30 days'} color="var(--cal)" accent="var(--cal)" />
            <StatCard label="Avg Protein / day" value={avgProtein} unit="g" sub="Across selected range" color="var(--protein)" accent="var(--protein)" />
            <StatCard label="Protein Peak" value={bestProteinDay ? bestProteinDay.protein : '—'} unit={bestProteinDay ? 'g' : ''} sub={bestProteinDay ? bestProteinDay.date : 'No data yet'} color="var(--carbs)" accent="var(--carbs)" />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Macro Trends */}
            <div style={chartStyle}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Macro Trends</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Daily protein, carbs &amp; fats intake</p>
              </div>
              {hasMacroData ? (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={macroData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--border)" tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font)' }} dy={8} />
                      <YAxis stroke="var(--border)" tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font)' }} width={36} axisLine={false} />
                      <Tooltip content={<MacroTooltip />} cursor={{ stroke: 'var(--border-2)', strokeWidth: 1 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', paddingTop: 12, fontFamily: 'var(--font)' }} />
                      <Area type="monotone" dataKey="protein" stroke="#3b82f6" fill="url(#gP)" name="Protein" strokeWidth={2} activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="carbs" stroke="#f59e0b" fill="url(#gC)" name="Carbs" strokeWidth={2} activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="fats" stroke="#f87171" fill="url(#gF)" name="Fats" strokeWidth={2} activeDot={{ r: 5, fill: '#f87171', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>}
                  title="No macro data yet"
                  sub="Log generated meals to see trends"
                />
              )}
            </div>

            {/* Pantry Distribution */}
            <div style={chartStyle}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Pantry Distribution</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Inventory breakdown by category</p>
              </div>
              {hasInventoryData ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center', height: 280 }}>
                  <div style={{ height: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={inventoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={68} paddingAngle={3} stroke="none" cornerRadius={4}>
                          {inventoryData.map(entry => (
                            <Cell key={entry.key} fill={categoryColors[entry.key] || '#4a5568'} />
                          ))}
                        </Pie>
                        <Tooltip content={<InventoryTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 280 }}>
                    {inventoryData.map(entry => (
                      <div key={entry.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColors[entry.key] || '#4a5568', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{entry.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{entry.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyChart
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8"/></svg>}
                  title="No inventory data"
                  sub="Add items to see distribution"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <GoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        goals={goals}
        onSaved={(saved) => updateUser({ goals: saved })}
      />
    </div>
  )
}

export default AnalyticsDashboard
