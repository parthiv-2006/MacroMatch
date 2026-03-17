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
    const [formData, setFormData] = useState({ targetProtein: '', targetCarbs: '', targetFats: '', flavorProfile: 'savory' })
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

    const onSubmit = async (e) => {
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
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Smart Engine</p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Meal Generator</h1>
                    <p className="mt-2 text-slate-500 font-medium max-w-xl leading-relaxed">
                        Enter your macro targets and let our algorithm build the perfect meal plan.
                    </p>
                </div>

                {selectedMeals.length > 0 && (
                    <button
                        onClick={handleConsume}
                        disabled={consuming}
                        className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-xl shadow-soft-md shadow-emerald-500/20 text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 active:scale-[0.98]"
                    >
                        {consuming ? 'Updating...' : `Consume Selected (${selectedMeals.length})`}
                    </button>
                )}
            </div>

            {/* Form Section */}
            <div className="bg-white shadow-soft-xl rounded-2xl p-6 sm:p-8 border border-slate-100 ring-1 ring-slate-200/50">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Target Macros</h2>
                <form onSubmit={onSubmit} className="space-y-6" noValidate>
                    {/* Flavor Profile */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Flavor Profile</label>
                        <div className="flex gap-3">
                            {['savory', 'sweet', 'neutral'].map((profile) => (
                                <button
                                    key={profile}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, flavorProfile: profile })}
                                    className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-200 border ${formData.flavorProfile === profile
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {profile.charAt(0).toUpperCase() + profile.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Macro Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { name: 'targetProtein', label: 'Protein', placeholder: '30', color: 'emerald' },
                            { name: 'targetCarbs', label: 'Carbs', placeholder: '50', color: 'blue' },
                            { name: 'targetFats', label: 'Fats', placeholder: '15', color: 'amber' }
                        ].map((field) => (
                            <div key={field.name}>
                                <label className={`block text-sm font-bold mb-2 text-slate-700`}>{field.label}</label>
                                <div className="relative rounded-xl shadow-sm">
                                    <input
                                        type="number"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={onChange}
                                        placeholder={field.placeholder}
                                        className={`focus:ring-${field.color}-500/50 focus:border-${field.color}-500 block w-full pl-4 pr-12 text-base font-semibold bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 transition-all duration-200 placeholder-slate-400`}
                                        style={{
                                            borderColor: errors[field.name] ? '#ef4444' : undefined,
                                            boxShadow: errors[field.name] ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none border-l border-slate-200/60 pl-3 my-2">
                                        <span className={`text-${field.color}-600 font-bold text-sm`}>g</span>
                                    </div>
                                </div>
                                <ValidationError show={!!errors[field.name]} message={errors[field.name]} />
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-soft-md text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] ${loading
                                    ? 'bg-emerald-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
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
                            ) : '🍽️ Generate from Pantry'}
                        </button>

                        <button
                            type="button"
                            onClick={onSubmitReverse}
                            disabled={reverseLoading}
                            className={`w-full flex justify-center py-3.5 px-4 border rounded-xl shadow-sm text-sm font-bold transition-all duration-200 active:scale-[0.98] ${reverseLoading
                                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500'
                                }`}
                        >
                            {reverseLoading ? 'Building...' : '🛒 Build Shopping List'}
                        </button>
                    </div>

                    <p className="text-xs font-medium text-slate-500 text-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Pantry Generator</span> builds meals using only what you have. <span className="font-bold text-slate-700">Shopping List Generator</span> finds optimal recipes and tells you what missing ingredients to buy.
                    </p>
                </form>
            </div>

            {/* Results Section */}
            {(mealPlans.length > 0 || reverseResult) && (
                <div ref={shoppingListRef} className="space-y-6 animate-fade-in-up">
                    {/* Tabs */}
                    {mealPlans.length > 0 && reverseResult && (
                        <div className="flex gap-6 border-b border-slate-200 px-2">
                            <button
                                onClick={() => setActiveTab('meals')}
                                className={`py-4 font-bold text-sm transition-all duration-200 border-b-2 ${activeTab === 'meals'
                                        ? 'border-emerald-500 text-emerald-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Meal Options ({mealPlans.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('shopping')}
                                className={`py-4 font-bold text-sm transition-all duration-200 border-b-2 ${activeTab === 'shopping'
                                        ? 'border-blue-500 text-blue-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Shopping List
                            </button>
                        </div>
                    )}

                    {/* Meal Plans Tab */}
                    {activeTab === 'meals' && mealPlans.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
                            {mealPlans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`bg-white shadow-soft-xl rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer flex flex-col h-full ${selectedMeals.includes(index)
                                            ? 'border-emerald-500 ring-4 ring-emerald-500/10'
                                            : 'border-slate-100 hover:border-emerald-300 hover:shadow-soft-2xl'
                                        }`}
                                    onClick={() => toggleMealSelection(index)}
                                >
                                    <div className={`px-6 py-5 flex justify-between items-center transition-colors ${selectedMeals.includes(index)
                                            ? 'bg-emerald-50 border-b border-emerald-100'
                                            : 'bg-slate-50 border-b border-slate-100'
                                        }`}>
                                        <h3 className={`text-lg font-black tracking-tight ${selectedMeals.includes(index) ? 'text-emerald-800' : 'text-slate-800'}`}>Recipe Option {index + 1}</h3>
                                        <button
                                            onClick={(e) => handleSaveRecipe(e, plan)}
                                            className={`p-2 rounded-xl transition-colors shadow-sm bg-white border ${selectedMeals.includes(index) ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'text-slate-500 border-slate-200 hover:text-brand-600 hover:bg-slate-100'}`}
                                            title="Save as Recipe"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <ul className="divide-y divide-slate-100 mb-6 flex-1">
                                            {Object.entries(plan).map(([ingredient, amount]) => (
                                                <li key={ingredient} className="py-3 flex justify-between items-center group">
                                                    <span className="text-slate-700 font-bold text-sm transition-colors group-hover:text-slate-900">{ingredient}</span>
                                                    <span className="text-xs font-black bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200/60 tabular-nums">
                                                        {amount}g
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto">
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">PRO</div>
                                                        <div className="font-black text-slate-900 text-sm tabular-nums">{formData.targetProtein}g</div>
                                                    </div>
                                                    <div className="text-center border-x border-slate-200">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">CRB</div>
                                                        <div className="font-black text-slate-900 text-sm tabular-nums">{formData.targetCarbs}g</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">FAT</div>
                                                        <div className="font-black text-slate-900 text-sm tabular-nums">{formData.targetFats}g</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`mt-4 h-8 flex items-center justify-center transition-all ${selectedMeals.includes(index) ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}>
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-black tracking-wide px-4 py-1.5 rounded-full uppercase border border-emerald-200">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Ready to cook
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Shopping List Tab */}
                    {activeTab === 'shopping' && reverseResult && (
                        <div className="space-y-6 pt-4">
                            <div className="bg-white shadow-soft-xl rounded-2xl border border-slate-100 p-6 sm:p-8 ring-1 ring-slate-200/50">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Target Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Protein Achieved', value: `${reverseResult.macros?.target?.protein}g`, color: 'emerald' },
                                        { label: 'Carbs Achieved', value: `${reverseResult.macros?.target?.carbs}g`, color: 'blue' },
                                        { label: 'Fats Achieved', value: `${reverseResult.macros?.target?.fats}g`, color: 'amber' },
                                        { label: 'Total Calories', value: reverseResult.macros?.achieved?.calories?.toFixed?.(0) || reverseResult.macros?.achieved?.calories, color: 'slate' }
                                    ].map((item) => (
                                        <div key={item.label} className={`bg-${item.color}-50 p-5 rounded-2xl border border-${item.color}-100 text-center`}>
                                            <div className={`text-[11px] font-bold uppercase tracking-widest text-${item.color}-600/80 mb-2`}>{item.label}</div>
                                            <div className={`text-2xl font-black text-${item.color}-700 tabular-nums`}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Meal Plan */}
                                <div className="bg-white shadow-soft-xl rounded-2xl border border-slate-100 p-6 sm:p-8 ring-1 ring-slate-200/50 flex flex-col h-full">
                                    <h4 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Optimum Recipe</h4>
                                    {reverseResult.plan && Object.keys(reverseResult.plan).length > 0 ? (
                                        <div className="overflow-auto flex-1 pr-2 hide-scrollbar">
                                            <ul className="divide-y divide-slate-100">
                                                {Object.entries(reverseResult.plan).map(([name, grams]) => (
                                                    <li key={name} className="py-3.5 flex justify-between items-center group">
                                                        <span className="text-slate-800 font-bold text-sm group-hover:text-blue-600 transition-colors">{name}</span>
                                                        <span className="text-xs font-black text-slate-700 bg-slate-50 border border-slate-200/60 rounded-md px-3 py-1.5 tabular-nums">
                                                            {grams}g
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                            <p className="text-sm font-semibold text-slate-500">No ingredients selected.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Shopping List */}
                                <div className="bg-white shadow-soft-xl rounded-2xl border border-slate-100 p-6 sm:p-8 ring-1 ring-slate-200/50 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                        <h4 className="text-lg font-bold text-slate-900">Missing Ingredients</h4>
                                        {reverseResult.shoppingList && reverseResult.shoppingList.length > 0 && (
                                            <span className="text-[11px] font-black tracking-widest uppercase text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full shadow-sm">
                                                Buy {reverseResult.shoppingList.length} items
                                            </span>
                                        )}
                                    </div>
                                    {reverseResult.shoppingList && reverseResult.shoppingList.length > 0 ? (
                                        <div className="overflow-auto flex-1 pr-2 hide-scrollbar">
                                            <ul className="divide-y divide-slate-100">
                                                {reverseResult.shoppingList.map(item => (
                                                    <li key={item.name} className="py-3.5 flex justify-between items-center group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                            <span className="text-slate-800 font-bold text-sm group-hover:text-amber-600 transition-colors">{item.name}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 tabular-nums shadow-sm">
                                                            {Math.round(item.amount)}g
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <span className="text-2xl">🎉</span>
                                            </div>
                                            <p className="text-base font-bold text-emerald-800">You have everything!</p>
                                            <p className="text-sm font-medium text-emerald-600 mt-1">Your pantry covers this entire recipe.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pantry Usage */}
                            {reverseResult.pantryUsage && reverseResult.pantryUsage.length > 0 && (
                                <div className="bg-white shadow-soft-xl rounded-2xl border border-slate-100 p-6 sm:p-8 ring-1 ring-slate-200/50">
                                    <h4 className="text-lg font-bold text-slate-900 mb-6">Pantry Usage Breakdown</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-100">
                                            <thead className="bg-slate-50 border-y border-slate-100">
                                                <tr>
                                                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-2/5">Ingredient</th>
                                                    <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recipe Needs</th>
                                                    <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">In Stock</th>
                                                    <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Missing</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {reverseResult.pantryUsage.map(row => (
                                                    <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-5 py-4 text-slate-800 font-bold text-sm">{row.name}</td>
                                                        <td className="px-5 py-4 text-right text-slate-600 font-semibold tabular-nums">{Math.round(row.needed)}g</td>
                                                        <td className="px-5 py-4 text-right text-slate-600 font-semibold tabular-nums">{Math.round(row.fromPantry)}g</td>
                                                        <td className="px-5 py-4 text-right">
                                                            {row.shortfall > 0 ? (
                                                                <span className="inline-flex items-center font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-sm tabular-nums shadow-sm">
                                                                    {Math.round(row.shortfall)}g
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-sm tabular-nums">
                                                                    ✓
                                                                </span>
                                                            )}
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
                        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center shadow-inner">
                            <div className="bg-white p-5 rounded-3xl inline-block mb-6 shadow-sm border border-slate-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Start Generating</h3>
                            <p className="mt-3 text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">Enter your daily macro targets above to let our algorithm find the perfect combinations.</p>
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
                message={`Are you sure you want to log ${selectedMeals.length} meal(s)? This will permanently remove the ingredients from your pantry inventory.`}
                confirmText="Consume Meals"
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
                message="Enter a name for this custom recipe:"
                placeholder="e.g. My Protein Bowl"
            />
        </div>
    )
}

export default GeneratorPage
