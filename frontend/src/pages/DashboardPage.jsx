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

function PantryIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8"/></svg>
}
function SparklesIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5z"/><path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5z"/></svg>
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function AlertIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}

const tabs = [
  { id: 'pantry', label: 'Pantry', Icon: PantryIcon },
  { id: 'generator', label: 'Meal Generator', Icon: SparklesIcon },
  { id: 'ingredient', label: 'Create Ingredient', Icon: PlusIcon },
]

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
      setPantryItems(items => items.map(item => item._id === id ? updated : item))
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

  const sideCard = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 20px',
    boxShadow: 'var(--shadow)',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>
          Pantry
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>My Kitchen</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>
          Manage inventory, generate meals, and track low-stock alerts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px',
                background: active ? 'rgba(22,163,74,.15)' : 'transparent',
                border: active ? '1px solid rgba(22,163,74,.3)' : '1px solid transparent',
                borderRadius: 6,
                color: active ? '#4ade80' : 'var(--text-2)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all .15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Icon />
              {label}
            </button>
          )
        })}
      </div>

      {/* Pantry Tab */}
      {activeTab === 'pantry' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stock Alerts */}
            <div style={sideCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, background: 'var(--warn-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warn)' }}>
                    <AlertIcon />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Stock Alerts</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warn)', background: 'var(--warn-bg)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(245,158,11,.2)' }}>
                  {loadingLowStock ? '…' : `${lowStock.length} low`}
                </span>
              </div>

              {loadingLowStock ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1, 2].map(i => <div key={i} style={{ height: 36, background: 'var(--surface2)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />)}
                </div>
              ) : lowStock.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>All good — pantry fully stocked.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {lowStock.slice(0, 4).map(item => (
                    <div
                      key={item._id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.ingredient?.name || 'Unknown'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          <span style={{ color: 'var(--warn)', fontWeight: 700 }}>{Math.round(item.quantity)}g</span> · threshold {item.threshold ?? 100}g
                        </p>
                      </div>
                      <button
                        onClick={() => promptAndUpdateThreshold(item)}
                        style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font)' }}
                      >
                        Adjust
                      </button>
                    </div>
                  ))}
                  {lowStock.length > 4 && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>+{lowStock.length - 4} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Add Item */}
            <div style={sideCard}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Add to Inventory</p>
              <AddItemForm onItemAdded={fetchPantry} />
            </div>

            {/* Quick Links */}
            <div style={sideCard}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Quick Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Generate Meal', tab: 'generator', icon: <SparklesIcon />, color: 'var(--green)', bg: 'var(--green-light)' },
                  { label: 'Create Ingredient', tab: 'ingredient', icon: <PlusIcon />, color: 'var(--protein)', bg: 'var(--protein-bg)' },
                ].map(({ label, tab, icon, color, bg }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font)',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = bg }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      <span style={{ color }}>{icon}</span>
                      {label}
                    </div>
                    <span style={{ color: 'var(--text-3)' }}><ChevronIcon /></span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pantry List */}
          <div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : error ? (
              <div style={{ background: 'var(--fat-bg)', border: '1px solid var(--fat)', borderRadius: 'var(--radius)', padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--fat)', fontWeight: 500 }}>
                {error}
              </div>
            ) : (
              <PantryList items={pantryItems} onDelete={handleDelete} onUpdate={handleUpdate} onUpdateThreshold={handleUpdateThreshold} />
            )}
          </div>
        </div>
      )}

      {/* Generator Tab */}
      {activeTab === 'generator' && <GeneratorPage />}

      {/* Create Ingredient Tab */}
      {activeTab === 'ingredient' && <CreateIngredient />}

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedItem(null) }}
        onConfirm={() => executeDelete()}
        title="Remove Item"
        message="Are you sure you want to remove this item from your pantry?"
        confirmText="Remove"
        showDontAskAgain={true}
        dontAskAgainKey="deleteItem"
      />

      <PromptModal
        isOpen={showThresholdModal}
        onClose={() => { setShowThresholdModal(false); setSelectedItem(null) }}
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
