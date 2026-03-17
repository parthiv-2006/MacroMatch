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
  protein: '#10b981', // emerald-500
  carb: '#f59e0b', // amber-500
  fat: '#f97316', // orange-500
  vegetable: '#059669', // emerald-600
  fruit: '#ec4899', // pink-500
  dairy: '#3b82f6', // blue-500
  spice: '#a855f7', // purple-500
  other: '#94a3b8' // slate-400
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
  
  // Extract values from payload array - each item has dataKey, value, and name
  const proteinData = payload.find(item => item.dataKey === 'protein')
  const carbsData = payload.find(item => item.dataKey === 'carbs')
  const fatsData = payload.find(item => item.dataKey === 'fats')

  return (
    <div className="rounded-xl bg-white shadow-soft-2xl border border-slate-100 px-5 py-4 text-sm ring-1 ring-slate-200/50 min-w-[200px]">
      <div className="font-bold text-slate-800 mb-3 pb-3 border-b border-slate-100">{label}</div>
      <div className="space-y-2.5 text-slate-600 font-medium tracking-wide">
        <div className="flex justify-between items-center gap-6"><span>Protein</span><span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{proteinData?.value || 0} g</span></div>
        <div className="flex justify-between items-center gap-6"><span>Carbs</span><span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{carbsData?.value || 0} g</span></div>
        <div className="flex justify-between items-center gap-6"><span>Fats</span><span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{fatsData?.value || 0} g</span></div>
      </div>
    </div>
  )
}

const InventoryTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const { name, value, percent } = payload[0].payload
  return (
    <div className="rounded-xl bg-white shadow-soft-2xl border border-slate-100 px-5 py-4 text-sm ring-1 ring-slate-200/50 min-w-[200px]">
      <div className="font-bold text-slate-800 mb-3 pb-3 border-b border-slate-100">{name}</div>
      <div className="space-y-2.5 text-slate-600 font-medium tracking-wide">
        <div className="flex justify-between items-center gap-6"><span>Quantity</span><span className="font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{Math.round(value)} g</span></div>
        <div className="flex justify-between items-center gap-6"><span>Share</span><span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{percent}%</span></div>
      </div>
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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Data Visualization</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">Track your macronutrient trends and see how your pantry inventory is distributed at a glance.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1.5 font-semibold border border-slate-200">
          <button
            onClick={() => setRange('7d')}
            className={`px-5 py-2 rounded-lg text-sm transition-all duration-200 ${range === '7d' ? 'bg-white text-brand-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-5 py-2 rounded-lg text-sm transition-all duration-200 ${range === '30d' ? 'bg-white text-brand-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Last 30 days
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 font-semibold">{error}</div>}

      {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-soft-sm relative overflow-hidden group hover:shadow-soft-md transition-shadow">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-emerald-100/50 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/80 mb-2 relative z-10">Total Calories</p>
                <div className="text-4xl font-black text-emerald-900 tracking-tight relative z-10">{Math.round(totalCalories)}</div>
                <p className="text-xs font-bold text-emerald-600/60 mt-2 uppercase tracking-wide relative z-10">{range === '7d' ? 'Last 7 days' : 'Last 30 days'}</p>
              </div>
              
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-soft-sm relative overflow-hidden group hover:shadow-soft-md transition-shadow">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-blue-100/50 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600/80 mb-2 relative z-10">Avg Protein / day</p>
                <div className="text-4xl font-black text-blue-900 tracking-tight relative z-10">{avgProtein} <span className="text-2xl text-blue-900/50">g</span></div>
                <p className="text-xs font-bold text-blue-600/60 mt-2 uppercase tracking-wide relative z-10">Across selected range</p>
              </div>
              
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 shadow-soft-sm relative overflow-hidden group hover:shadow-soft-md transition-shadow">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-amber-100/50 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600/80 mb-2 relative z-10">Protein Peak</p>
                <div className="text-4xl font-black text-amber-900 tracking-tight relative z-10">{bestProteinDay ? bestProteinDay.protein : '—'} {bestProteinDay && <span className="text-2xl text-amber-900/50">g</span>}</div>
                <p className="text-xs font-bold text-amber-600/60 mt-2 uppercase tracking-wide relative z-10">{bestProteinDay ? bestProteinDay.date : 'No data yet'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft-xl ring-1 ring-slate-200/50">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Macro Trends</h2>
                  <p className="text-sm text-slate-500 font-medium">Daily intake of Protein, Carbs, and Fats</p>
                </div>
                {hasMacroData ? (
                  <div className="h-80 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={macroData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorFats" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} axisLine={{ stroke: '#e2e8f0' }} />
                        <YAxis stroke="#94a3b8" tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} width={45} dx={-10} axisLine={false} />
                        <Tooltip content={<MacroTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600, color: '#475569' }} />
                        <Area type="monotone" dataKey="protein" stackId="1" stroke="#10b981" fill="url(#colorProtein)" name="Protein" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                        <Area type="monotone" dataKey="carbs" stackId="1" stroke="#3b82f6" fill="url(#colorCarbs)" name="Carbs" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                        <Area type="monotone" dataKey="fats" stackId="1" stroke="#f59e0b" fill="url(#colorFats)" name="Fats" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <div className="p-4 bg-white rounded-full mb-4 shadow-sm border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <p className="font-bold text-slate-700">No macro data yet</p>
                    <p className="text-sm mt-1 font-medium">Log your generated meals to see trends</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft-xl ring-1 ring-slate-200/50">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Pantry Distribution</h2>
                  <p className="text-sm text-slate-500 font-medium">Inventory value breakdown by category</p>
                </div>
                {hasInventoryData ? (
                  <div className="h-80 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                    <div className="h-full relative min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={75}
                            paddingAngle={4}
                            stroke="none"
                            cornerRadius={6}
                          >
                            {inventoryData.map((entry) => (
                              <Cell key={entry.key} fill={categoryColors[entry.key] || '#cbd5e1'} />
                            ))}
                          </Pie>
                          <Tooltip content={<InventoryTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{Math.round(totalCalories / 1000)}k</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Total Kcal</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 overflow-y-auto max-h-72 pr-2 hide-scrollbar">
                      {inventoryData.map((entry) => (
                        <div key={entry.key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 hover:bg-slate-100 transition-colors shadow-sm">
                          <div className="flex items-center space-x-3.5">
                            <span className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: categoryColors[entry.key] || '#cbd5e1' }}></span>
                            <span className="text-sm font-bold text-slate-700">{entry.name}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{entry.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <div className="p-4 bg-white rounded-full mb-4 shadow-sm border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="font-bold text-slate-700">No inventory data</p>
                    <p className="text-sm mt-1 font-medium">Add items to see distribution</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default AnalyticsDashboard
