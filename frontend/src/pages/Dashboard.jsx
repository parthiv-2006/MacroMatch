import {useState, useEffect, useContext} from 'react'
import AddItemForm from '../components/AddItemForm'
import PantryList from '../components/PantryList'
import pantryServices from '../services/pantryServices'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

const Dashboard = () => {
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lowStock, setLowStock] = useState([])
  const [loadingLowStock, setLoadingLowStock] = useState(true)
  const navigate = useNavigate()

  const { logout } = useContext(AuthContext)

  const fetchPantry = async () => {
    try {
      const data = await pantryServices.getPantryItems()
      setPantryItems(data)
      setLoadingLowStock(true)
      fetchLowStock()
    } catch(err) {
      setError('Failed to load pantry items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStock = async () => {
    try {
      const data = await pantryServices.getLowStockItems()
      setLowStock(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingLowStock(false)
    }
  }

  useEffect(() => {
    fetchPantry()
    fetchLowStock()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return
    try {
    await pantryServices.deletePantryItem(id)
    setPantryItems(items => items.filter(item => item._id !== id))
    fetchLowStock()
  }  catch(err) {
      alert("Failed to delete Pantry Item")
  }
}
  const handleNavigate = (url) => {
    navigate(url)
  }

  const handleUpdate = async (id, newQuantity) => {
    try {
      const updated = await pantryServices.updatePantryItem(id, { quantity: newQuantity })
      setPantryItems(items => items.map(item => 
        item._id === id ? updated : item
      ))
      setLowStock(list => list.map(item => item._id === updated._id ? updated : item))
    } catch (err) {
      alert('Failed to update item')
    }
  }

  const handleUpdateThreshold = async (id, newThreshold) => {
    try {
      const updated = await pantryServices.updatePantryItem(id, { threshold: newThreshold })
      setPantryItems(items => items.map(item => item._id === id ? updated : item))
      // refresh low-stock list to reflect new threshold status
      fetchLowStock()
    } catch (err) {
      alert('Failed to update threshold')
    }
  }

  const promptAndUpdateThreshold = (item) => {
    const next = window.prompt('Set low-stock threshold (grams)', item.threshold ?? 100)
    if (next === null || next === '') return
    const numeric = Number(next)
    if (Number.isNaN(numeric) || numeric < 0) return alert('Please enter a valid non-negative number')
    handleUpdateThreshold(item._id, numeric)
  }

  return (
    <div className="space-y-10 text-white">
      <main className="max-w-7xl mx-auto py-6">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-white sm:truncate tracking-tight">
              My Kitchen Pantry
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Manage your ingredients and track your inventory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Add Item & Actions */}
          <div className="space-y-8 lg:col-span-1">
            {/* Low Stock Alert */}
            <div className="bg-white/5 shadow-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Low Stock Alerts</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  {loadingLowStock ? '...' : lowStock.length}
                </span>
              </div>
              {loadingLowStock ? (
                <p className="text-sm text-slate-400">Loading...</p>
              ) : lowStock.length === 0 ? (
                <p className="text-sm text-slate-400">All good! Nothing is below threshold.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {lowStock.slice(0, 4).map(item => (
                    <li key={item._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{item.ingredient?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{Math.round(item.quantity)}g left • threshold {item.threshold ?? 100}g</p>
                      </div>
                      <button
                        onClick={() => promptAndUpdateThreshold(item)}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                      >
                        Adjust
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {lowStock.length > 4 && (
                <p className="mt-2 text-xs text-slate-500">Showing first 4 items.</p>
              )}
            </div>

            {/* Add Item Card */}
            <div className="bg-white/5 shadow-lg rounded-2xl p-6 border border-white/10">
              <AddItemForm onItemAdded={fetchPantry}/>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/5 shadow-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-slate-900 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <span className="mr-2">📊</span> Dashboard
                </button>
                <button 
                  onClick={() => handleNavigate('/new-ingredient')}
                  className="w-full group flex items-center justify-center px-4 py-3 border border-white/10 shadow-sm text-sm font-medium rounded-xl text-white bg-white/5 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                >
                  <span className="mr-3 text-emerald-400 bg-emerald-500/10 rounded-full p-1 group-hover:bg-emerald-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  Create New Ingredient
                </button>
                <button 
                  onClick={() => handleNavigate('/generate')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <span className="mr-2">⚡</span> Generate Meal Plan
                </button>
                <button 
                  onClick={() => handleNavigate('/history')}
                  className="w-full group flex items-center justify-center px-4 py-3 border border-white/10 shadow-sm text-sm font-medium rounded-xl text-white bg-white/5 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                >
                  <span className="mr-3 text-blue-400 bg-blue-500/10 rounded-full p-1 group-hover:bg-blue-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  View Meal History
                </button>
                <button 
                  onClick={() => handleNavigate('/recipes')}
                  className="w-full group flex items-center justify-center px-4 py-3 border border-white/10 shadow-sm text-sm font-medium rounded-xl text-white bg-white/5 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                >
                  <span className="mr-3 text-amber-400 bg-amber-500/10 rounded-full p-1 group-hover:bg-amber-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  My Recipes
                </button>
              </div>
              <p className="mt-6 text-xs text-slate-500 text-center font-medium">
                Can't find an ingredient? <button onClick={() => handleNavigate('/new-ingredient')} className="text-emerald-400 hover:text-emerald-300 hover:underline transition">Create it first</button>.
              </p>
            </div>
          </div>

          {/* Right Column: Pantry List */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 shadow-lg rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Current Inventory</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                  {pantryItems.length} Items
                </span>
              </div>
              <div className="p-0 flex-grow">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-200 text-center py-10 bg-red-500/10 m-6 rounded-lg border border-red-500/20">{error}</div>
                ) : (
                  <PantryList items={pantryItems} onDelete={handleDelete} onUpdate={handleUpdate} onUpdateThreshold={handleUpdateThreshold}/>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
