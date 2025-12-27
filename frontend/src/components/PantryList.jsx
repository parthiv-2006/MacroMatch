import React from 'react'

const PantryList = ({ items, onDelete }) => {
  if (!items || items.length === 0) {
    return <p>Your pantry is empty. Add some food!</p>
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

            return (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{ingredient.name}</td>
                <td>{quantity}g</td>
                <td>{(ingredient.protein * ratio).toFixed(1)}g</td>
                <td>{(ingredient.carbs * ratio).toFixed(1)}g</td>
                <td>{(ingredient.fats * ratio).toFixed(1)}g</td>
                <td>{Math.round(ingredient.calories * ratio)}</td>
                <td>
                  <button 
                    onClick={() => onDelete(item._id)}
                    style={{ 
                      backgroundColor: '#ff4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    Delete
                  </button>
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