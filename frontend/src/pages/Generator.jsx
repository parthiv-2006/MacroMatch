import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import solverServices from "../services/solverServices";

const Generator = () => {
    const [formData, setFormData] = useState({targetProtein: '', targetCarbs: '', targetFats: ''})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mealPlan, setMealPlan] = useState(null)
    const navigate = useNavigate()
    
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState, [e.target.name]: e.target.value
        }))
    }

    const onSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMealPlan(null)

        try {
            const response = await solverServices.generateMeal(formData)
            setMealPlan(response.mealPlan)
        } catch (err) {
            setError(err.message || 'Failed to generate meal plan')
        } finally {
            setLoading(false)
        }
    }
    
    
    return (
    <div className="dashboard-container">
        <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>&larr; Back to Dashboard</button>
      <section className="heading">
        <h1>Generate Meal Plan</h1>
        <p>Enter your macro targets</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Protein (g)</label>
            <input
              type="number"
              name="targetProtein"
              value={formData.targetProtein}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Carbs (g)</label>
            <input
              type="number"
              name="targetCarbs"
              value={formData.targetCarbs}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fats (g)</label>
            <input
              type="number"
              name="targetFats"
              value={formData.targetFats}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </section>

      {error && <div className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</div>}

      {mealPlan && (
        <section className="content">
          <h2>Your Meal Plan</h2>
          <div className="meal-plan-results">
            {Object.entries(mealPlan).length > 0 ? (
              <ul className="goals">
                {Object.entries(mealPlan).map(([ingredient, amount]) => (
                  <li key={ingredient} className="goal">
                    <div>
                        <strong>{ingredient}</strong>
                    </div>
                    <div>
                        {amount}g
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ingredients selected.</p>
            )}
          </div>
        </section>
      )}
    </div>
    )
}

export default Generator