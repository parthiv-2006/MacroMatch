import ingredientServices from "../services/ingredientServices";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


function CreateIngredient() {
    const navigate = useNavigate()
    const [ingredient, setIngredient] = useState({name: '', calories: '', 
        protein: '', carbs: '', fats: '', servingSize: 100})
    const [error, setError] = useState('')

    const handleChange = (e) => {
    setIngredient({ ...ingredient, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const { calories, protein, carbs, fats } = ingredient
        const calculatedCals = (Number(protein) * 4) + (Number(carbs) * 4) + (Number(fats) * 9)
    
        // Warn if calories are wildly different (>20% off)
        if (Math.abs(Number(calories) - calculatedCals) > (Number(calories) * 0.2)) {
        if (!window.confirm(`Warning: Your macros sum to ~${Math.round(calculatedCals)} kcal, but you entered ${calories} kcal. Continue?`)) {
            return
        }
        }

        try {
            await ingredientServices.createIngredient({
                name: ingredient.name,
                calories: Number(ingredient.calories),
                protein: Number(ingredient.protein),
                carbs: Number(ingredient.carbs),
                fats: Number(ingredient.fats),
                servingSize: Number(ingredient.servingSize)
            })
            alert('Ingredient Created!')
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ingredient')
        }


    }

    return (
      <div className="create-ingredient-container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>&larr; Back to Dashboard</button>
      <h2>Create New Food</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Food Name:
          <input name="name" value={ingredient.name} onChange={handleChange} required placeholder="e.g. My Protein Bar" />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Serving Size (g):
            <input type="number" name="servingSize" value={ingredient.servingSize} onChange={handleChange} required />
            <small style={{ color: '#666' }}>Default is 100g</small>
          </label>
          
          <label>
            Calories (per serving):
            <input type="number" name="calories" value={ingredient.calories} onChange={handleChange} required />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <label>
            Protein (g):
            <input type="number" name="protein" value={ingredient.protein} onChange={handleChange} required />
          </label>
          <label>
            Carbs (g):
            <input type="number" name="carbs" value={ingredient.carbs} onChange={handleChange} required />
          </label>
          <label>
            Fats (g):
            <input type="number" name="fats" value={ingredient.fats} onChange={handleChange} required />
          </label>
        </div>

        <button type="submit" style={{ padding: '0.75rem', marginTop: '1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
          Save
        </button>
      </form>
    </div>
    )
}

export default CreateIngredient