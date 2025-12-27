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
    <div className="pantry-list">
      <h3>Current Inventory</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>Food</th>
            <th>Qty (g)</th>
            <th>Protein</th>
            <th>Carbs</th>
            <th>Fats</th>
            <th>Calories</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            // Safety check: if an ingredient was deleted from DB, skip rendering
            if (!item.ingredient) return null

            const { ingredient, quantity } = item
            // Calculate ratio (DB values are per 100g)
            const ratio = quantity / 100
            const isEditing = item._id === editingId

            return (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{ingredient.name}</td>

                <td>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      style={{ width: '60px' }}
                    />
                  ) : (
                    `${quantity}g`
                  )}
                </td>

                <td>{(ingredient.protein * ratio).toFixed(1)}g</td>
                <td>{(ingredient.carbs * ratio).toFixed(1)}g</td>
                <td>{(ingredient.fats * ratio).toFixed(1)}g</td>
                <td>{Math.round(ingredient.calories * ratio)}</td>
                <td>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(item._id)} style={{ marginRight: '5px', color: 'green' }}>Save</button>
                      <button onClick={cancelEditing} style={{ color: 'gray' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(item)} style={{ marginRight: '5px', color: 'blue' }}>Edit</button>
                      <button 
                        onClick={() => onDelete(item._id)}
                        style={{ color: 'red' }}
                      >
                        Delete
                      </button>
                    </>
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