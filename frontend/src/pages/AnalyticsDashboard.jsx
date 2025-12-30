import { useEffect, useMemo, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'
import pantryServices from '../services/pantryServices'
import AuthContext from '../context/AuthContext'

const categoryLabels = {
  protein: 'Protein Sources',
  carb: 'Grains & Carbs',
  fat: 'Fats & Oils',
  vegetable: 'Vegetables',
  fruit: 'Fruits',
  dairy: 'Dairy',
  spice: 'Spices',
  other: 'Other'
}

const categoryColors = {
  protein: '#22c55e',
  carb: '#eab308',
  fat: '#f97316',
  vegetable: '#10b981',
  fruit: '#f472b6',
  dairy: '#60a5fa',
  spice: '#c084fc',
  other: '#94a3b8'
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
  for (let i = 0; i < days; i += 1) {
    const current = new Date(cutoff)
    current.setDate(cutoff.getDate() + i)
    const key = current.toISOString()
    const entry = byDay.get(key) || { protein: 0, carbs: 0, fats: 0, calories: 0 }
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
    key,
    name: categoryLabels[key] || key,
    value,
    percent: grandTotal ? Math.round((value / grandTotal) * 100) : 0
  }))
}

const MacroTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null
  const data = payload.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})

  return (
    <div className="rounded-xl bg-white shadow-lg border border-slate-200 px-4 py-3 text-sm">
      <div className="font-semibold text-slate-800 mb-1">{label}</div>
      <div className="space-y-1 text-slate-600">
        <div className="flex justify-between"><span>Protein</span><span className="font-medium text-emerald-600">{Math.round(data.protein || 0)} g</span></div>
        <div className="flex justify-between"><span>Carbs</span><span className="font-medium text-blue-600">{Math.round(data.carbs || 0)} g</span></div>
        <div className="flex justify-between"><span>Fats</span><span className="font-medium text-amber-600">{Math.round(data.fats || 0)} g</span></div>
      </div>
    </div>
  )
}

const InventoryTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const { name, value } = payload[0].payload
  return (
    <div className="rounded-xl bg-white shadow-lg border border-slate-200 px-4 py-3 text-sm">
      <div className="font-semibold text-slate-800 mb-1">{name}</div>
      <div className="text-slate-600">{Math.round(value)} g in pantry</div>
    </div>
  )
}

const AnalyticsDashboard = () => {
  const [history, setHistory] = useState([])
  const [pantryItems, setPantryItems] = useState([])
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

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
  }, [])

  const macroData = useMemo(() => buildMacroSeries(history, range === '7d' ? 7 : 30), [history, range])
  const inventoryData = useMemo(() => buildInventoryBreakdown(pantryItems), [pantryItems])

  const totalCalories = macroData.reduce((sum, day) => sum + (day.calories || 0), 0)
  const avgProtein = macroData.length ? Math.round(macroData.reduce((sum, day) => sum + (day.protein || 0), 0) / macroData.length) : 0
  const bestProteinDay = macroData.reduce((best, day) => (day.protein > (best?.protein || 0) ? day : best), null)

  const hasMacroData = macroData.some((d) => d.protein || d.carbs || d.fats)
  const hasInventoryData = inventoryData.length > 0 && inventoryData.some((d) => d.value > 0)

  return (
    <div className="min-h-screen bg-[#0b1524] text-white">
      <nav className="bg-[#0f1c2f]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text tracking-tight">MacroMatch</span>
            <div className="hidden sm:flex items-center space-x-3 text-sm">
              <button onClick={() => navigate('/')} className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/5 transition">
                Pantry
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/10 shadow-inner">Dashboard</button>
              <button onClick={() => navigate('/history')} className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/5 transition">
                History
              </button>
              <button onClick={() => navigate('/recipes')} className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/5 transition">
                Recipes
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/generate')}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition"
            >
              Generate Plan
            </button>
            <button
              onClick={() => logout()}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 border border-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">Data Visualization</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-slate-300 mt-2">Track macro trends and see how your pantry is distributed at a glance.</p>
          </div>
          <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1 text-xs font-semibold">
            <button
              onClick={() => setRange('7d')}
              className={`px-3 py-1 rounded-full transition ${range === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:text-white'}`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-3 py-1 rounded-full transition ${range === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:text-white'}`}
            >
              Last 30 days
            </button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-100">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-400 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-emerald-500/10">
                <p className="text-xs uppercase tracking-wide text-slate-300">Total Calories</p>
                <div className="text-3xl font-bold text-white mt-2">{Math.round(totalCalories)}</div>
                <p className="text-xs text-slate-400 mt-1">{range === '7d' ? 'Last 7 days' : 'Last 30 days'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-500/10">
                <p className="text-xs uppercase tracking-wide text-slate-300">Avg Protein / day</p>
                <div className="text-3xl font-bold text-white mt-2">{avgProtein} g</div>
                <p className="text-xs text-slate-400 mt-1">Across selected range</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-amber-500/10">
                <p className="text-xs uppercase tracking-wide text-slate-300">Protein Peak</p>
                <div className="text-3xl font-bold text-white mt-2">{bestProteinDay ? `${bestProteinDay.protein} g` : '—'}</div>
                <p className="text-xs text-slate-400 mt-1">{bestProteinDay ? bestProteinDay.date : 'No data yet'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-emerald-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-300">Macro Trends</p>
                    <h2 className="text-xl font-semibold text-white">Protein / Carb / Fat</h2>
                  </div>
                </div>
                {hasMacroData ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={macroData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorFats" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} width={40} />
                        <Tooltip content={<MacroTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="protein" stackId="1" stroke="#22c55e" fill="url(#colorProtein)" name="Protein" strokeWidth={2} />
                        <Area type="monotone" dataKey="carbs" stackId="1" stroke="#60a5fa" fill="url(#colorCarbs)" name="Carbs" strokeWidth={2} />
                        <Area type="monotone" dataKey="fats" stackId="1" stroke="#f59e0b" fill="url(#colorFats)" name="Fats" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-slate-300 border border-dashed border-white/10 rounded-xl">
                    No macro data yet. Log meals to see trends.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-300">Inventory Value</p>
                    <h2 className="text-xl font-semibold text-white">Pantry Distribution</h2>
                  </div>
                </div>
                {hasInventoryData ? (
                  <div className="h-80 grid grid-cols-1 md:grid-cols-2 items-center">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={3}
                          >
                            {inventoryData.map((entry) => (
                              <Cell key={entry.key} fill={categoryColors[entry.key] || '#cbd5e1'} />
                            ))}
                          </Pie>
                          <Tooltip content={<InventoryTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {inventoryData.map((entry) => (
                        <div key={entry.key} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 border border-white/5">
                          <div className="flex items-center space-x-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColors[entry.key] || '#cbd5e1' }}></span>
                            <span className="text-sm text-white">{entry.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-emerald-200">{entry.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-slate-300 border border-dashed border-white/10 rounded-xl">
                    Add items to your pantry to see the distribution.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AnalyticsDashboard
