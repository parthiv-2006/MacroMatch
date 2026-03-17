import { useState } from 'react'
import { Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

const PantryList = ({ items, onDelete, onUpdate, onUpdateThreshold }) => {

  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!items || items.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center h-full">
        <div className="bg-slate-50 p-6 rounded-3xl inline-block mb-6 border border-slate-100 shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Your pantry is empty</h3>
        <p className="mt-3 text-sm text-slate-500 max-w-sm leading-relaxed">Add an item to your inventory to start generating macro-aligned meals and get low stock alerts.</p>
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
    if (sortConfig.key !== column) return <span className="ml-1 text-slate-300 inline-block w-3 opacity-0 group-hover:opacity-50 transition-opacity"><ArrowUp size={14} /></span>
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="ml-1 text-emerald-500 font-bold inline-block" />
      : <ArrowDown size={14} className="ml-1 text-emerald-500 font-bold inline-block" />
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
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y border-t border-slate-100 divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            <th scope="col" onClick={() => handleSort('name')} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group select-none w-1/4">
              <div className="flex items-center">Food <SortIcon column="name" /></div>
            </th>
            <th scope="col" onClick={() => handleSort('quantity')} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group select-none">
              <div className="flex items-center">Qty <SortIcon column="quantity" /></div>
            </th>
            <th scope="col" onClick={() => handleSort('protein')} className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group select-none">
              <div className="flex items-center">Prot <SortIcon column="protein" /></div>
            </th>
            <th scope="col" onClick={() => handleSort('carbs')} className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group select-none">
              <div className="flex items-center">Carbs <SortIcon column="carbs" /></div>
            </th>
            <th scope="col" onClick={() => handleSort('fats')} className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group select-none">
              <div className="flex items-center">Fats <SortIcon column="fats" /></div>
            </th>
            <th scope="col" onClick={() => handleSort('calories')} className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group select-none">
              <div className="flex items-center">Cals <SortIcon column="calories" /></div>
            </th>
            <th scope="col" className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {sortedItems.map((item, index) => {
            if (!item.ingredient) return null

            const { ingredient, quantity } = item
            const ratio = quantity / 100
            const isEditing = item._id === editingId

            return (
              <tr
                key={item._id}
                className="hover:bg-slate-50/60 transition-colors group/row"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <span className="truncate max-w-xs font-bold text-slate-800 text-sm" title={ingredient.name}>{ingredient.name}</span>
                    {item.isLowStock && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-amber-100 text-amber-700">LOW</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-24 px-3 py-1.5 text-sm bg-white border border-emerald-300 text-slate-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-semibold"
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold bg-slate-100/80 border border-slate-200/50 text-slate-700 px-3.5 py-1.5 rounded-lg text-sm tabular-nums">{quantity}g</span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-md tabular-nums font-semibold">{(ingredient.protein * ratio).toFixed(1)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                  <span className="text-blue-700 bg-blue-50 border border-blue-100/50 px-2.5 py-1 rounded-md tabular-nums font-semibold">{(ingredient.carbs * ratio).toFixed(1)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                  <span className="text-amber-700 bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-md tabular-nums font-semibold">{(ingredient.fats * ratio).toFixed(1)}</span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-slate-800 tabular-nums">
                  {Math.round(ingredient.calories * ratio)} <span className="text-slate-400 font-medium text-[11px] tracking-wide">KCAL</span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isEditing ? (
                    <div className="flex justify-end space-x-2">
                       <button
                        onClick={() => saveEdit(item._id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2 items-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit quantity"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
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