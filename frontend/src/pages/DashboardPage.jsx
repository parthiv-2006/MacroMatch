import { useState, useEffect, useContext } from 'react'
import AddItemForm from '../components/AddItemForm'
import PantryList from '../components/PantryList'
import pantryServices from '../services/pantryServices'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import GeneratorPage from './GeneratorPage'
import CreateIngredient from './CreateIngredient'
import ConfirmModal from '../components/ConfirmModal'
import PromptModal from '../components/PromptModal'
import { PackageOpen, Sparkles, PlusCircle, AlertTriangle, ChevronRight } from 'lucide-react'

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
    } catch (err) {
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
    } catch (err) {
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
    { id: 'pantry', label: 'Pantry', icon: PackageOpen },
    { id: 'generator', label: 'Meal Generator', icon: Sparkles },
    { id: 'ingredient', label: 'Create Ingredient', icon: PlusCircle }
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          My Kitchen
        </h2>
        <p className="mt-3 text-base text-slate-500 max-w-2xl leading-relaxed">
          Manage your inventory, automatically generate meals, and keep your pantry stocked with the right ingredients.
        </p>
      </div>

      {/* Modern Pill Tabs */}
      <div className="flex gap-2 w-full overflow-x-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200 sm:w-max hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-2.5 font-semibold text-sm rounded-xl whitespace-nowrap transition-all duration-200 ${isActive
                  ? 'bg-white text-emerald-700 shadow-soft-sm shadow-black/5'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* Pantry Tab */}
        {activeTab === 'pantry' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column: Alerts & Actions */}
              <div className="space-y-8 lg:col-span-1">
                {/* Low Stock Alert */}
                <div className="bg-white shadow-soft-xl rounded-2xl p-6 border border-slate-100 relative overflow-hidden ring-1 ring-slate-200/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shadow-sm">
                        <AlertTriangle size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Stock Alerts</h3>
                    </div>
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-700">
                      {loadingLowStock ? '...' : `${lowStock.length} low`}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    {loadingLowStock ? (
                      <div className="flex flex-col gap-3">
                        <div className="h-10 animate-pulse bg-slate-100 rounded-lg w-full"></div>
                        <div className="h-10 animate-pulse bg-slate-100 rounded-lg w-full"></div>
                      </div>
                    ) : lowStock.length === 0 ? (
                      <p className="text-sm font-medium text-slate-500">All good! Your pantry is fully stocked.</p>
                    ) : (
                      <ul className="space-y-3">
                        {lowStock.slice(0, 4).map(item => (
                          <li key={item._id} className="flex items-center justify-between group p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{item.ingredient?.name || 'Unknown'}</p>
                              <p className="text-[11px] font-medium text-slate-500 mt-1"><span className="text-amber-600 font-bold">{Math.round(item.quantity)}g</span> left • threshold {item.threshold ?? 100}g</p>
                            </div>
                            <button
                              onClick={() => promptAndUpdateThreshold(item)}
                              className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-500 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Adjust
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {lowStock.length > 4 && (
                      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400 text-center">+{lowStock.length - 4} more items</p>
                    )}
                  </div>
                </div>

                {/* Add Item Card */}
                <div className="bg-white shadow-soft-xl rounded-2xl p-6 border border-slate-100 ring-1 ring-slate-200/50">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Add to Inventory</h3>
                  <AddItemForm onItemAdded={fetchPantry} />
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white shadow-soft-xl rounded-2xl p-6 border border-slate-100 ring-1 ring-slate-200/50">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Links</h3>
                  <div className="space-y-3.5">
                    <button
                      onClick={() => setActiveTab('generator')}
                      className="w-full group flex items-center justify-between px-5 py-4 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-soft-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          <Sparkles size={18} />
                        </div>
                        Generate Meal
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('ingredient')}
                      className="w-full group flex items-center justify-between px-5 py-4 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-soft-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <PlusCircle size={18} />
                        </div>
                        Create Ingredient
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Pantry List */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow-soft-2xl rounded-2xl border border-slate-100 ring-1 ring-slate-200/50 overflow-hidden h-full flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shadow-sm">
                        <PackageOpen size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Current Inventory</h3>
                    </div>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {pantryItems.length} Items
                    </span>
                  </div>
                  <div className="p-0 grow bg-white overflow-hidden">
                    {loading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                      </div>
                    ) : error ? (
                      <div className="text-red-600 text-center py-10 bg-red-50 m-6 rounded-xl border border-red-100 font-medium">{error}</div>
                    ) : (
                      <PantryList items={pantryItems} onDelete={handleDelete} onUpdate={handleUpdate} onUpdateThreshold={handleUpdateThreshold} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <div className="animate-fade-in-up">
            <GeneratorPage />
          </div>
        )}

        {/* Create Ingredient Tab */}
        {activeTab === 'ingredient' && (
          <div className="animate-fade-in-up">
            <CreateIngredient />
          </div>
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
