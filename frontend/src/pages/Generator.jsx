import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import solverServices from "../services/solverServices";
import pantryServices from "../services/pantryServices";
import recipeServices from "../services/recipeServices";
import { toast } from "react-toastify";

const Generator = () => {
    const [formData, setFormData] = useState({targetProtein: '', targetCarbs: '', targetFats: ''})
    const [loading, setLoading] = useState(false)
    const [mealPlans, setMealPlans] = useState([])
    const [selectedMeals, setSelectedMeals] = useState([])
    const [consuming, setConsuming] = useState(false)
    const navigate = useNavigate()
    
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState, [e.target.name]: e.target.value
        }))
    }

    const onSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        setMealPlans([])
        setSelectedMeals([])

        try {
            const response = await solverServices.generateMeal(formData)
            setMealPlans(response.mealPlans)
        } catch (err) {
            toast.error(err.message || 'Failed to generate meal plan')
        } finally {
            setLoading(false)
        }
    }

    const toggleMealSelection = (index) => {
        if (selectedMeals.includes(index)) {
            setSelectedMeals(selectedMeals.filter(i => i !== index))
        } else {
            setSelectedMeals([...selectedMeals, index])
        }
    }

    const handleConsume = async () => {
        if (selectedMeals.length === 0) return
        if (!window.confirm(`Are you sure you want to consume ${selectedMeals.length} meal(s)? This will remove items from your pantry.`)) return

        setConsuming(true)
        try {
            // Aggregate ingredients from all selected meals
            const aggregatedIngredients = {}
            
            selectedMeals.forEach(index => {
                const plan = mealPlans[index]
                Object.entries(plan).forEach(([ingredient, amount]) => {
                    if (aggregatedIngredients[ingredient]) {
                        aggregatedIngredients[ingredient] += amount
                    } else {
                        aggregatedIngredients[ingredient] = amount
                    }
                })
            })

            await pantryServices.consumePantryItems(aggregatedIngredients)
            toast.success("Meals consumed! Pantry updated.")
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to consume meals")
        } finally {
            setConsuming(false)
        }
    }

    const handleSaveRecipe = async (e, plan) => {
        e.stopPropagation() // Prevent card selection
        const name = prompt("Enter a name for this recipe:")
        if (!name) return

        try {
            await recipeServices.createRecipe({
                name,
                ingredients: plan
            })
            toast.success("Recipe saved successfully!")
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save recipe")
        }
    }
    
    
    return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button 
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meal Generator</h1>
                <p className="mt-2 text-sm text-slate-500">
                Let our algorithm build the perfect meal from your pantry.
                </p>
            </div>
          </div>
          
          {selectedMeals.length > 0 && (
              <button
                onClick={handleConsume}
                disabled={consuming}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
              >
                  {consuming ? 'Updating...' : `Consume Selected (${selectedMeals.length})`}
              </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Input Section */}
          <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Target Macros</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Protein (g)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="targetProtein"
                    value={formData.targetProtein}
                    onChange={onChange}
                    required
                    className="focus:ring-emerald-500/20 focus:border-emerald-500 block w-full pl-4 pr-12 sm:text-sm border-slate-200 rounded-xl py-2.5 transition-all duration-200"
                    placeholder="e.g. 30"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">g</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Carbs (g)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="targetCarbs"
                    value={formData.targetCarbs}
                    onChange={onChange}
                    required
                    className="focus:ring-emerald-500/20 focus:border-emerald-500 block w-full pl-4 pr-12 sm:text-sm border-slate-200 rounded-xl py-2.5 transition-all duration-200"
                    placeholder="e.g. 50"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">g</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fats (g)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="targetFats"
                    value={formData.targetFats}
                    onChange={onChange}
                    required
                    className="focus:ring-emerald-500/20 focus:border-emerald-500 block w-full pl-4 pr-12 sm:text-sm border-slate-200 rounded-xl py-2.5 transition-all duration-200"
                    placeholder="e.g. 15"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">g</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-200
                  ${loading 
                    ? 'bg-emerald-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </span>
                ) : 'Generate Meal Plan'}
              </button>
            </form>
            
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {mealPlans.length > 0 ? (
              mealPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white shadow-sm rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer ${selectedMeals.includes(index) ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'}`}
                onClick={() => toggleMealSelection(index)}
              >
                <div className={`px-6 py-4 flex justify-between items-center ${selectedMeals.includes(index) ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
                  <h2 className="text-lg font-medium text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Option {index + 1}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => handleSaveRecipe(e, plan)}
                        className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                        title="Save as Recipe"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                    {selectedMeals.includes(index) && (
                        <span className="bg-white text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">Selected</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Object.entries(plan).length > 0 ? (
                      <ul className="divide-y divide-slate-100">
                        {Object.entries(plan).map(([ingredient, amount]) => (
                          <li key={ingredient} className="py-3 flex justify-between items-center">
                            <span className="text-slate-900 font-medium">{ingredient}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {amount}g
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 italic">No ingredients selected.</p>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Protein</div>
                        <div className="font-bold text-slate-900">{formData.targetProtein}g</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Carbs</div>
                        <div className="font-bold text-slate-900">{formData.targetCarbs}g</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Fats</div>
                        <div className="font-bold text-slate-900">{formData.targetFats}g</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center h-full flex flex-col justify-center items-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-slate-900">No Meal Plan Generated</h3>
                <p className="mt-1 text-sm text-slate-500">Enter your targets on the left to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    )
}

export default Generator