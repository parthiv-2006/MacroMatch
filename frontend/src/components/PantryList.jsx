import {useState} from 'react'

const PantryList = ({ items, onDelete, onUpdate, onUpdateThreshold }) => {

  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')

  if (!items || items.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="bg-slate-50 p-4 rounded-full inline-block mb-4 border border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Your pantry is empty</h3>
        <p className="mt-1 text-sm text-slate-500">Add an item to start tracking quantities and macros.</p>
      </div>
    )
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
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Food</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Protein</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Carbs</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fats</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cals</th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold</th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {items.map((item, index) => {
            // Safety check: if an ingredient was deleted from DB, skip rendering
            if (!item.ingredient) return null

            const { ingredient, quantity } = item
            // Calculate ratio (DB values are per 100g)
            const ratio = quantity / 100
            const isEditing = item._id === editingId

            return (
              <tr 
                key={item._id} 
                className="hover:bg-slate-50/80 transition-colors animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center space-x-2">
                  <span>{ingredient.name}</span>
                  {item.isLowStock && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">Low</span>
                  )}
                </td>

                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      autoFocus
                    />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-slate-100 text-slate-800">
                      {quantity}g
                    </span>
                  )}
                </td>

                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">{(ingredient.protein * ratio).toFixed(1)}g</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">{(ingredient.carbs * ratio).toFixed(1)}g</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">{(ingredient.fats * ratio).toFixed(1)}g</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-900">{Math.round(ingredient.calories * ratio)}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-slate-500">Threshold: {item.threshold ?? 100}g</span>
                    {onUpdateThreshold && (
                      <button
                        onClick={() => handleThreshold(item)}
                        className="text-emerald-600 text-xs font-semibold hover:underline"
                      >
                        Adjust
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => saveEdit(item._id)} 
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                        title="Save"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
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
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(item._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
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