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
  const navigate = useNavigate()

  const { logout } = useContext(AuthContext)

  const fetchPantry = async () => {
    try {
      const data = await pantryServices.getPantryItems()
      setPantryItems(data)
    } catch(err) {
      setError('Failed to load pantry items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPantry()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return
    try {
    await pantryServices.deletePantryItem(id)
    setPantryItems(items => items.filter(item => item._id !== id))
  }  catch(err) {
      alert("Failed to delete Pantry Item")
  }
}
  const handleNavigate = (url) => {
    navigate(url)
  }

  const handleUpdate = async (id, newQuantity) => {
    try {
    await pantryServices.updatePantryItem(id, { quantity: newQuantity })
    setPantryItems(items => items.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ))
  } catch (err) {
    alert('Failed to update item')
  }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-emerald-600 tracking-tight">MacroMatch</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => logout()}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
              My Kitchen Pantry
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your ingredients and track your inventory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Add Item & Actions */}
          <div className="space-y-6 lg:col-span-1">
            {/* Add Item Card */}
            <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
              <AddItemForm onItemAdded={fetchPantry}/>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigate('/new-ingredient')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  <span className="mr-2">+</span> Create New Ingredient
                </button>
                <button 
                  onClick={() => handleNavigate('/generate')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  <span className="mr-2">⚡</span> Generate Meal Plan
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-400 text-center">
                Can't find an ingredient? Create it first.
              </p>
            </div>
          </div>

          {/* Right Column: Pantry List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-medium text-slate-900">Current Inventory</h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-4">{error}</div>
                ) : (
                  <PantryList items={pantryItems} onDelete={handleDelete} onUpdate={handleUpdate}/>
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
