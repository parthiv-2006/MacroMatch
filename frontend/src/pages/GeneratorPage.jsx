import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import solverServices from "../services/solverServices";
import pantryServices from "../services/pantryServices";
import recipeServices from "../services/recipeServices";
import ValidationError from "../components/ValidationError";
import ConfirmModal from "../components/ConfirmModal";
import PromptModal from "../components/PromptModal";
import { toast } from "react-toastify";

const GeneratorPage = () => {
    const [formData, setFormData] = useState({targetProtein: '', targetCarbs: '', targetFats: '', flavorProfile: 'savory'})
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [mealPlans, setMealPlans] = useState([])
    const [selectedMeals, setSelectedMeals] = useState([])
    const [consuming, setConsuming] = useState(false)
    const [reverseLoading, setReverseLoading] = useState(false)
    const [reverseResult, setReverseResult] = useState(null)
    const [activeTab, setActiveTab] = useState('meals')
    const [showConsumeModal, setShowConsumeModal] = useState(false)
    const [showRecipeModal, setShowRecipeModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const shoppingListRef = useRef(null)
    const navigate = useNavigate()
    
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState, [e.target.name]: e.target.value
        }))
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    const onSubmit = async(e) => {
        e.preventDefault()
        const newErrors = {}
        
        if (!formData.targetProtein) {
            newErrors.targetProtein = 'Protein target is required'
        } else if (Number(formData.targetProtein) <= 0) {
            newErrors.targetProtein = 'Protein target must be greater than 0'
        }
        
        if (!formData.targetCarbs) {
            newErrors.targetCarbs = 'Carbs target is required'
        } else if (Number(formData.targetCarbs) <= 0) {
            newErrors.targetCarbs = 'Carbs target must be greater than 0'
        }
        
        if (!formData.targetFats) {
            newErrors.targetFats = 'Fats target is required'
        } else if (Number(formData.targetFats) <= 0) {
            newErrors.targetFats = 'Fats target must be greater than 0'
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        
        setErrors({})
        setLoading(true)
        setMealPlans([])
        setSelectedMeals([])
        setReverseResult(null)
        setActiveTab('meals')

        try {
            const response = await solverServices.generateMeal(formData)
            setMealPlans(response.mealPlans)
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to generate meal plan')
        } finally {
            setLoading(false)
        }
    }

    const onSubmitReverse = async (e) => {
        e.preventDefault()
        const newErrors = {}
        
        if (!formData.targetProtein) {
            newErrors.targetProtein = 'Protein target is required'
        } else if (Number(formData.targetProtein) <= 0) {
            newErrors.targetProtein = 'Protein target must be greater than 0'
        }
        
        if (!formData.targetCarbs) {
            newErrors.targetCarbs = 'Carbs target is required'
        } else if (Number(formData.targetCarbs) <= 0) {
            newErrors.targetCarbs = 'Carbs target must be greater than 0'
        }
        
        if (!formData.targetFats) {
            newErrors.targetFats = 'Fats target is required'
        } else if (Number(formData.targetFats) <= 0) {
            newErrors.targetFats = 'Fats target must be greater than 0'
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        
        setErrors({})
        setReverseLoading(true)
        setReverseResult(null)

        try {
            const response = await solverServices.generateReverseMeal(formData)
            setReverseResult(response)
            setActiveTab('shopping')
            setTimeout(() => shoppingListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to generate shopping list')
        } finally {
            setReverseLoading(false)
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
        
        // Check if user has opted out of confirmation
        const dontAsk = localStorage.getItem('dontAsk_consumeMeals')
        if (dontAsk === 'true') {
            executeConsume()
        } else {
            setShowConsumeModal(true)
        }
    }

    const executeConsume = async () => {
        setConsuming(true)
        try {
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

    const handleSaveRecipe = (e, plan) => {
        e.stopPropagation()
        setSelectedPlan(plan)
        setShowRecipeModal(true)
    }

    const executeSaveRecipe = async (name) => {
        if (!name || !selectedPlan) return

        try {
            await recipeServices.createRecipe({
                name,
                ingredients: selectedPlan
            })
            toast.success("Recipe saved successfully!")
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save recipe")
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Meal Generator</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your macro targets and let our algorithm build the perfect meal plan.
                    </p>
                </div>
                
                {selectedMeals.length > 0 && (
                    <button
                        onClick={handleConsume}
                        disabled={consuming}
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
                    >
                        {consuming ? 'Updating...' : `Consume (${selectedMeals.length})`}
                    </button>
                )}
            </div>

            {/* Form Section */}
            <div className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl p-8 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-6">Target Macros</h2>
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                    {/* Flavor Profile */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Flavor Profile</label>
                        <div className="flex gap-2">
                            {['savory', 'sweet', 'neutral'].map((profile) => (
                                <button
                                    key={profile}
                                    type="button"
                                    onClick={() => setFormData({...formData, flavorProfile: profile})}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        formData.flavorProfile === profile 
                                            ? 'bg-emerald-500 text-white shadow-lg' 
                                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                                    }`}
                                >
                                    {profile.charAt(0).toUpperCase() + profile.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Macro Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {name: 'targetProtein', label: 'Protein', placeholder: '30'},
                            {name: 'targetCarbs', label: 'Carbs', placeholder: '50'},
                            {name: 'targetFats', label: 'Fats', placeholder: '15'}
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label} (g)</label>
                                <div className="relative rounded-xl shadow-sm">
                                    <input
                                        type="number"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={onChange}
                                        placeholder={field.placeholder}
                                        className="focus:ring-emerald-500/50 block w-full pl-4 pr-12 sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 transition-all duration-200 placeholder-slate-500"
                                        style={{
                                            borderColor: errors[field.name] ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                            boxShadow: errors[field.name] ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 sm:text-sm">g</span>
                                    </div>
                                </div>
                                <ValidationError show={!!errors[field.name]} message={errors[field.name]} />
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                                loading 
                                    ? 'bg-emerald-400 cursor-not-allowed' 
                                    : 'bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </span>
                            ) : '🔄 Generate Meal (Pantry)'}
                        </button>

                        <button
                            type="button"
                            onClick={onSubmitReverse}
                            disabled={reverseLoading}
                            className={`w-full flex justify-center py-3 px-4 border rounded-xl shadow-sm text-sm font-medium transition-all duration-200 ${
                                reverseLoading 
                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed border-white/10' 
                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                            }`}
                        >
                            {reverseLoading ? 'Building...' : '🛒 Shopping List'}
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 pt-2">
                        <span className="font-semibold text-slate-300">Pantry:</span> uses only your ingredients. <span className="font-semibold text-slate-300">Shopping List:</span> shows what to buy.
                    </p>
                </form>
            </div>

            {/* Results Section */}
            {(mealPlans.length > 0 || reverseResult) && (
                <div ref={shoppingListRef} className="space-y-6">
                    {/* Tabs */}
                    {mealPlans.length > 0 && reverseResult && (
                        <div className="flex gap-2 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('meals')}
                                className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                                    activeTab === 'meals'
                                        ? 'border-emerald-500 text-white'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                🍽️ Meal Plans ({mealPlans.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('shopping')}
                                className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                                    activeTab === 'shopping'
                                        ? 'border-emerald-500 text-white'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                🛒 Shopping List
                            </button>
                        </div>
                    )}

                    {/* Meal Plans Tab */}
                    {activeTab === 'meals' && mealPlans.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mealPlans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`bg-white/5 backdrop-blur-lg shadow-lg rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                                        selectedMeals.includes(index) 
                                            ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-xl' 
                                            : 'border-white/10 hover:border-emerald-500/50 hover:shadow-xl hover:bg-white/10'
                                    }`}
                                    onClick={() => toggleMealSelection(index)}
                                >
                                    <div className={`px-6 py-4 flex justify-between items-center ${
                                        selectedMeals.includes(index) 
                                            ? 'bg-linear-to-r from-emerald-600 to-teal-600' 
                                            : 'bg-linear-to-r from-emerald-500 to-teal-500'
                                    }`}>
                                        <h3 className="text-lg font-semibold text-white">Option {index + 1}</h3>
                                        <button
                                            onClick={(e) => handleSaveRecipe(e, plan)}
                                            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                                            title="Save as Recipe"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <ul className="divide-y divide-white/10 mb-6">
                                            {Object.entries(plan).map(([ingredient, amount]) => (
                                                <li key={ingredient} className="py-3 flex justify-between items-center">
                                                    <span className="text-slate-200 font-medium text-sm">{ingredient}</span>
                                                    <span className="text-xs font-semibold bg-white/10 text-slate-300 px-2.5 py-1 rounded-full">
                                                        {amount}g
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="border-t border-white/10 pt-4">
                                            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">Summary</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-white/5 p-2 rounded-lg text-center">
                                                    <div className="text-xs text-slate-400">Protein</div>
                                                    <div className="font-bold text-white text-sm">{formData.targetProtein}g</div>
                                                </div>
                                                <div className="bg-white/5 p-2 rounded-lg text-center">
                                                    <div className="text-xs text-slate-400">Carbs</div>
                                                    <div className="font-bold text-white text-sm">{formData.targetCarbs}g</div>
                                                </div>
                                                <div className="bg-white/5 p-2 rounded-lg text-center">
                                                    <div className="text-xs text-slate-400">Fats</div>
                                                    <div className="font-bold text-white text-sm">{formData.targetFats}g</div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedMeals.includes(index) && (
                                            <div className="mt-3 text-center">
                                                <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                                                    ✓ Selected
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Shopping List Tab */}
                    {activeTab === 'shopping' && reverseResult && (
                        <div className="space-y-6">
                            <div className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Target Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {label: 'Protein', value: `${reverseResult.macros?.target?.protein}g`},
                                        {label: 'Carbs', value: `${reverseResult.macros?.target?.carbs}g`},
                                        {label: 'Fats', value: `${reverseResult.macros?.target?.fats}g`},
                                        {label: 'Calories', value: reverseResult.macros?.achieved?.calories?.toFixed?.(0) || reverseResult.macros?.achieved?.calories}
                                    ].map((item) => (
                                        <div key={item.label} className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                            <div className="text-xs text-slate-400 mb-2">{item.label}</div>
                                            <div className="text-xl font-bold text-emerald-400">{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Meal Plan */}
                                <div className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl border border-white/10 p-6">
                                    <h4 className="text-base font-semibold text-white mb-4">Meal Plan</h4>
                                    {reverseResult.plan && Object.keys(reverseResult.plan).length > 0 ? (
                                        <div className="max-h-96 overflow-auto">
                                            <ul className="divide-y divide-white/10">
                                                {Object.entries(reverseResult.plan).map(([name, grams]) => (
                                                    <li key={name} className="py-3 flex justify-between items-center">
                                                        <span className="text-slate-200 font-medium text-sm">{name}</span>
                                                        <span className="text-xs font-semibold text-slate-300 bg-white/10 rounded-full px-3 py-1">
                                                            {grams}g
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">No ingredients selected.</p>
                                    )}
                                </div>

                                {/* Shopping List */}
                                <div className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl border border-white/10 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-base font-semibold text-white">Shopping List</h4>
                                        {reverseResult.shoppingList && (
                                            <span className="text-xs font-semibold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full">
                                                {reverseResult.shoppingList.length} items
                                            </span>
                                        )}
                                    </div>
                                    {reverseResult.shoppingList && reverseResult.shoppingList.length > 0 ? (
                                        <div className="max-h-96 overflow-auto">
                                            <ul className="divide-y divide-white/10">
                                                {reverseResult.shoppingList.map(item => (
                                                    <li key={item.name} className="py-3 flex justify-between items-center">
                                                        <span className="text-slate-200 font-medium text-sm">{item.name}</span>
                                                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 rounded-full px-3 py-1">
                                                            {Math.round(item.amount)}g
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">✓ Your pantry covers this plan!</p>
                                    )}
                                </div>
                            </div>

                            {/* Pantry Usage */}
                            {reverseResult.pantryUsage && reverseResult.pantryUsage.length > 0 && (
                                <div className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl border border-white/10 p-6">
                                    <h4 className="text-base font-semibold text-white mb-4">Pantry Usage</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-white/10 text-sm">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Ingredient</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Needed</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Available</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Shortfall</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {reverseResult.pantryUsage.map(row => (
                                                    <tr key={row.name} className="hover:bg-white/5 transition">
                                                        <td className="px-4 py-3 text-slate-200 font-medium">{row.name}</td>
                                                        <td className="px-4 py-3 text-right text-slate-300">{Math.round(row.needed)}g</td>
                                                        <td className="px-4 py-3 text-right text-slate-300">{Math.round(row.fromPantry)}g</td>
                                                        <td className={`px-4 py-3 text-right font-semibold ${row.shortfall > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                            {Math.round(row.shortfall)}g
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {mealPlans.length === 0 && !reverseResult && (
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl border-2 border-dashed border-white/10 p-12 text-center">
                            <div className="bg-white/5 p-4 rounded-full inline-block mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Get started!</h3>
                            <p className="mt-2 text-slate-400">Enter your macro targets above to generate meal plans.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={showConsumeModal}
                onClose={() => setShowConsumeModal(false)}
                onConfirm={executeConsume}
                title="Consume Meals"
                message={`Are you sure you want to consume ${selectedMeals.length} meal(s)? This will remove items from your pantry.`}
                confirmText="Consume"
                showDontAskAgain={true}
                dontAskAgainKey="consumeMeals"
            />

            <PromptModal
                isOpen={showRecipeModal}
                onClose={() => {
                    setShowRecipeModal(false)
                    setSelectedPlan(null)
                }}
                onSubmit={executeSaveRecipe}
                title="Save Recipe"
                message="Enter a name for this recipe:"
                placeholder="e.g. My Protein Bowl"
            />
        </div>
    )
}

export default GeneratorPage
