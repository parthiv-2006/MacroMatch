import {useState} from 'react'

const PantryList = ({ items, onDelete, onUpdate }) => {

  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')

  if (!items || items.length === 0) {
    return <p>Your pantry is empty. Add some food!</p>
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
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Food</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Protein</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Carbs</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fats</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cals</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map((item) => {
            // Safety check: if an ingredient was deleted from DB, skip rendering
            if (!item.ingredient) return null

            const { ingredient, quantity } = item
            // Calculate ratio (DB values are per 100g)
            const ratio = quantity / 100
            const isEditing = item._id === editingId

            return (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ingredient.name}</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  ) : (
                    `${quantity}g`
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(ingredient.protein * ratio).toFixed(1)}g</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(ingredient.carbs * ratio).toFixed(1)}g</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(ingredient.fats * ratio).toFixed(1)}g</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{Math.round(ingredient.calories * ratio)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => saveEdit(item._id)} className="text-emerald-600 hover:text-emerald-900">Save</button>
                      <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-3">
                      <button onClick={() => startEditing(item)} className="text-emerald-600 hover:text-emerald-900">Edit</button>
                      <button 
                        onClick={() => onDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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