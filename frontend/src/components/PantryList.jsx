import { useState } from 'react'
import { Edit2, Trash2, ArrowUp, ArrowDown, Settings2, PackageCheck } from 'lucide-react'

const PantryList = ({ items, onDelete, onUpdate, onUpdateThreshold }) => {

  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

  if (!items || items.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center w-full bg-white rounded-3xl shadow-sm border border-zinc-100">
        <div className="bg-zinc-50 p-6 rounded-3xl inline-block mb-6 border border-zinc-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Your pantry is empty</h3>
        <p className="mt-3 text-sm text-zinc-500 max-w-sm leading-relaxed">Add an item to your inventory to start generating macro-aligned meals and get low stock alerts.</p>
      </div>
    )
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setIsSortMenuOpen(false)
  }

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig.key) return 0
    if (!a.ingredient || !b.ingredient) return 0

    let valA, valB

    if (sortConfig.key === 'name') {
      valA = a.ingredient.name.toLowerCase()
      valB = b.ingredient.name.toLowerCase()
    } else if (['protein', 'carbs', 'fats', 'calories'].includes(sortConfig.key)) {
      const ratioA = a.quantity / 100
      const ratioB = b.quantity / 100
      valA = a.ingredient[sortConfig.key] * ratioA
      valB = b.ingredient[sortConfig.key] * ratioB
    } else if (sortConfig.key === 'quantity') {
      valA = a.quantity
      valB = b.quantity
    } else {
      valA = a[sortConfig.key]
      valB = b[sortConfig.key]
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="ml-2 text-emerald-600 font-bold inline-block" />
      : <ArrowDown size={14} className="ml-2 text-emerald-600 font-bold inline-block" />
  }

  const startEditing = (item) => {
    setEditingId(item._id)
    setEditQty(item.quantity)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditQty('')
  }

  const saveEdit = (id) => {
    if (editQty === '' || isNaN(editQty) || Number(editQty) < 0) return
    onUpdate(id, Number(editQty))
    setEditingId(null)
  }

  const sortOptions = [
    { label: 'Name', key: 'name' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Calories', key: 'calories' },
    { label: 'Protein', key: 'protein' },
    { label: 'Carbs', key: 'carbs' },
    { label: 'Fats', key: 'fats' },
  ]

  return (
    <div className="w-full space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
           <PackageCheck className="text-emerald-600" size={24} />
           Current Inventory
           <span className="ml-2 text-xs font-semibold bg-zinc-100 text-zinc-500 py-1 px-2.5 rounded-full">{items.length}</span>
        </h2>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
          >
            <Settings2 size={16} className="text-zinc-400" />
            Sort By: {sortOptions.find(opt => opt.key === sortConfig.key)?.label || 'Name'}
            <SortIcon column={sortConfig.key} />
          </button>
          
          {isSortMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsSortMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] border border-zinc-100 z-20 py-2 overflow-hidden animate-fade-in-up">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSort(option.key)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 flex justify-between items-center transition-colors"
                  >
                    <span className={sortConfig.key === option.key ? 'text-emerald-700 font-bold' : 'text-zinc-600'}>
                      {option.label}
                    </span>
                    {sortConfig.key === option.key && (
                       sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-emerald-500" /> : <ArrowDown size={14} className="text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedItems.map((item) => {
          if (!item.ingredient) return null

          const { ingredient, quantity } = item
          const ratio = quantity / 100
          const isEditing = item._id === editingId

          return (
            <div 
              key={item._id} 
              className="group flex flex-col bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Header: Name and Status */}
              <div className="flex justify-between items-start mb-4">
                <div className="pr-4">
                  <h3 className="font-semibold text-zinc-900 text-lg leading-tight mb-1 truncate max-w-[180px]" title={ingredient.name}>
                    {ingredient.name}
                  </h3>
                  {item.isLowStock && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-50 text-amber-600 border border-amber-100/50">
                      LOW STOCK
                    </span>
                  )}
                </div>
                
                {/* Quantity or Edit Input */}
                <div className="shrink-0 text-right">
                   {isEditing ? (
                     <div className="flex flex-col items-end gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            onKeyDown={(e) => {
                               if (e.key === 'Enter') saveEdit(item._id)
                               if (e.key === 'Escape') cancelEditing()
                            }}
                            className="w-20 px-2.5 py-1.5 text-sm bg-zinc-50 border border-emerald-300 text-zinc-900 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-right pr-6"
                            autoFocus
                          />
                          <span className="absolute right-2 top-1.5 text-xs font-semibold text-zinc-400 pointer-events-none">g</span>
                        </div>
                        <div className="flex gap-1.5">
                           <button onClick={cancelEditing} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-700 bg-zinc-100 px-2 py-1 rounded">Cancel</button>
                           <button onClick={() => saveEdit(item._id)} className="text-[10px] font-bold text-white hover:bg-emerald-700 bg-emerald-600 px-2 py-1 rounded">Save</button>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-end">
                       <span className="font-bold text-zinc-800 text-lg tabular-nums leading-none mb-1">{quantity} <span className="text-xs text-zinc-400 font-semibold ml-0.5">g</span></span>
                     </div>
                   )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-50">
                 {/* Macros Badges */}
                 <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50/80 text-emerald-700 border border-emerald-100/50">
                      Prot <span className="ml-1 font-bold">{(ingredient.protein * ratio).toFixed(0)}g</span>
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50/80 text-blue-700 border border-blue-100/50">
                      Carb <span className="ml-1 font-bold">{(ingredient.carbs * ratio).toFixed(0)}g</span>
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50/80 text-amber-700 border border-amber-100/50">
                      Fat <span className="ml-1 font-bold">{(ingredient.fats * ratio).toFixed(0)}g</span>
                    </span>
                 </div>

                 {/* Footer: Calories and Actions */}
                 <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-1.5 opacity-90">
                       <span className="font-black text-zinc-800 text-xl tabular-nums tracking-tight">{Math.round(ingredient.calories * ratio)}</span>
                       <span className="text-zinc-400 font-bold text-[10px] tracking-widest uppercase">Kcal</span>
                    </div>

                    {/* Hover Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditing(item) }}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          title="Edit quantity"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(item._id) }}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PantryList