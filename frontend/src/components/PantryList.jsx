import {useState} from 'react'

const PantryList = ({ items, onDelete, onUpdate, onUpdateThreshold }) => {

  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!items || items.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="bg-white/5 p-4 rounded-full inline-block mb-4 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white">Your pantry is empty</h3>
        <p className="mt-1 text-sm text-slate-400">Add an item to start tracking quantities and macros.</p>
      </div>
    )
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig.key) return 0
    if (!a.ingredient || !b.ingredient) return 0

    let valA, valB

    // Handle nested properties
    if (sortConfig.key === 'name') {
      valA = a.ingredient.name.toLowerCase()
      valB = b.ingredient.name.toLowerCase()
    } else if (['protein', 'carbs', 'fats', 'calories'].includes(sortConfig.key)) {
      // Sort by total amount in the current quantity, not per 100g
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
    if (sortConfig.key !== column) return <span className="ml-1 text-slate-300">↕</span>
    return sortConfig.direction === 'asc' 
      ? <span className="ml-1 text-emerald-600">↑</span> 
      : <span className="ml-1 text-emerald-600">↓</span>
  }

  const handleThreshold = (item) => {
    if (!onUpdateThreshold) return
    const next = window.prompt('Set low-stock threshold (grams)', item.threshold ?? 100)
    if (next === null || next === '') return
    const numeric = Number(next)
    if (Number.isNaN(numeric) || numeric < 0) return alert('Please enter a valid non-negative number')
    onUpdateThreshold(item._id, numeric)
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
    onUpdate(id, Number(editQty))
    setEditingId(null)
  }

  return (
    <div className="overflow-x-auto">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
      <table className="min-w-full divide-y divide-white/5">
        <thead className="bg-white/5">
          <tr>
            <th scope="col" onClick={() => handleSort('name')} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group">
              Food <SortIcon column="name" />
            </th>
            <th scope="col" onClick={() => handleSort('quantity')} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group">
              Qty <SortIcon column="quantity" />
            </th>
            <th scope="col" onClick={() => handleSort('protein')} className="px-2 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group">
              Prot <SortIcon column="protein" />
            </th>
            <th scope="col" onClick={() => handleSort('carbs')} className="px-2 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group">
              Carbs <SortIcon column="carbs" />
            </th>
            <th scope="col" onClick={() => handleSort('fats')} className="px-2 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group">
              Fats <SortIcon column="fats" />
            </th>
            <th scope="col" onClick={() => handleSort('calories')} className="px-2 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group">
              Cals <SortIcon column="calories" />
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Threshold
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedItems.map((item, index) => {
            // Safety check: if an ingredient was deleted from DB, skip rendering
            if (!item.ingredient) return null

            const { ingredient, quantity } = item
            // Calculate ratio (DB values are per 100g)
            const ratio = quantity / 100
            const isEditing = item._id === editingId

            return (
              <tr 
                key={item._id} 
                className="hover:bg-white/5 transition-colors animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  <div className="flex items-center space-x-2">
                    <span className="truncate max-w-[120px] sm:max-w-[180px]" title={ingredient.name}>{ingredient.name}</span>
                    {item.isLowStock && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30">Low</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400">
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium bg-white/10 px-2 py-1 rounded-md text-slate-300">{quantity}g</span>
                  )}
                </td>

                <td className="px-2 py-4 whitespace-nowrap text-sm text-slate-400">
                  {(ingredient.protein * ratio).toFixed(1)}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-slate-400">
                  {(ingredient.carbs * ratio).toFixed(1)}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-slate-400">
                  {(ingredient.fats * ratio).toFixed(1)}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                  {Math.round(ingredient.calories * ratio)}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-right text-xs text-slate-400">
                  <div className="flex flex-col items-end gap-1">
                    <span>{item.threshold ?? 100}g</span>
                    <button 
                      onClick={() => handleThreshold(item)}
                      className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
                    >
                      Adjust
                    </button>
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => saveEdit(item._id)} 
                        className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full transition-colors"
                        title="Save"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        className="p-2 text-slate-400 hover:text-slate-300 hover:bg-white/10 rounded-full transition-colors"
                        title="Cancel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => startEditing(item)} 
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all duration-200"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(item._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default PantryList