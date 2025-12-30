import {useState, useEffect, useContext} from 'react'
import AddItemForm from '../components/AddItemForm'
import PantryList from '../components/PantryList'
import pantryServices from '../services/pantryServices'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import GeneratorPage from './GeneratorPage'
import CreateIngredient from './CreateIngredient'
import ConfirmModal from '../components/ConfirmModal'
import PromptModal from '../components/PromptModal'

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('pantry')
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lowStock, setLowStock] = useState([])
  const [loadingLowStock, setLoadingLowStock] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showThresholdModal, setShowThresholdModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
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
    const dontAsk = localStorage.getItem('dontAsk_deleteItem')
    if (dontAsk === 'true') {
      executeDelete(id)
    } else {
      setSelectedItem(id)
      setShowDeleteModal(true)
    }
  }

  const executeDelete = async (id) => {
    const itemId = id || selectedItem
    try {
      await pantryServices.deletePantryItem(itemId)
      setPantryItems(items => items.filter(item => item._id !== itemId))
      fetchLowStock()
    } catch(err) {
      alert("Failed to delete Pantry Item")
    }
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
      fetchLowStock()
    } catch (err) {
      alert('Failed to update threshold')
    }
  }

  const promptAndUpdateThreshold = (item) => {
    setSelectedItem(item)
    setShowThresholdModal(true)
  }

  const executeUpdateThreshold = (value) => {
    if (!value || !selectedItem) return
    const numeric = Number(value)
    if (Number.isNaN(numeric) || numeric < 0) {
      alert('Please enter a valid non-negative number')
      return
    }
    handleUpdateThreshold(selectedItem._id, numeric)
  }

  const tabs = [
    { id: 'pantry', label: '📦 Pantry', icon: 'pantry' },
    { id: 'generator', label: '🔄 Meal Generator', icon: 'generator' },
    { id: 'ingredient', label: '➕ Create Ingredient', icon: 'ingredient' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold leading-7 text-white sm:truncate tracking-tight">
          My Kitchen
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Manage your inventory, generate meals, and add ingredients.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Pantry Tab */}
        {activeTab === 'pantry' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column: Alerts & Actions */}
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
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('generator')}
                      className="w-full group flex items-center justify-center px-4 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="mr-2">⚡</span> Generate Meal
                    </button>
                    <button 
                      onClick={() => setActiveTab('ingredient')}
                      className="w-full group flex items-center justify-center px-4 py-3 border border-white/10 shadow-sm text-sm font-medium rounded-xl text-white bg-white/5 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="mr-3 text-emerald-400 bg-emerald-500/10 rounded-full p-1 group-hover:bg-emerald-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      Create Ingredient
                    </button>
                  </div>
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
                  <div className="p-0 grow">
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
          </div>
        )}

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <GeneratorPage />
        )}

        {/* Create Ingredient Tab */}
        {activeTab === 'ingredient' && (
          <CreateIngredient />
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedItem(null)
        }}
        onConfirm={() => executeDelete()}
        title="Remove Item"
        message="Are you sure you want to remove this item from your pantry?"
        confirmText="Remove"
        showDontAskAgain={true}
        dontAskAgainKey="deleteItem"
      />

      <PromptModal
        isOpen={showThresholdModal}
        onClose={() => {
          setShowThresholdModal(false)
          setSelectedItem(null)
        }}
        onSubmit={executeUpdateThreshold}
        title="Set Low-Stock Threshold"
        message="Enter the threshold (in grams) below which you want to be alerted:"
        placeholder="e.g. 100"
        defaultValue={String(selectedItem?.threshold ?? 100)}
        inputType="number"
      />
    </div>
  )
}

export default DashboardPage
