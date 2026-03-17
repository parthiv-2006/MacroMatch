import ingredientServices from "../services/ingredientServices";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import ValidationError from "../components/ValidationError";
import ConfirmModal from "../components/ConfirmModal";


function CreateIngredient() {
    const navigate = useNavigate()
    const [ingredient, setIngredient] = useState({
        name: '', calories: '',
        protein: '', carbs: '', fats: '', servingSize: 100
    })
    const [errors, setErrors] = useState({})
    const [showCalorieWarning, setShowCalorieWarning] = useState(false)
    const [calculatedCals, setCalculatedCals] = useState(0)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setIngredient({ ...ingredient, [e.target.name]: e.target.value })
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = {}

        if (!ingredient.name.trim()) {
            newErrors.name = 'Food name is required'
        }

        if (!ingredient.calories) {
            newErrors.calories = 'Calories are required'
        } else if (Number(ingredient.calories) <= 0) {
            newErrors.calories = 'Calories must be greater than 0'
        }

        if (!ingredient.protein) {
            newErrors.protein = 'Protein is required'
        } else if (Number(ingredient.protein) < 0) {
            newErrors.protein = 'Protein cannot be negative'
        }

        if (!ingredient.carbs) {
            newErrors.carbs = 'Carbs are required'
        } else if (Number(ingredient.carbs) < 0) {
            newErrors.carbs = 'Carbs cannot be negative'
        }

        if (!ingredient.fats) {
            newErrors.fats = 'Fats are required'
        } else if (Number(ingredient.fats) < 0) {
            newErrors.fats = 'Fats cannot be negative'
        }

        if (!ingredient.servingSize) {
            newErrors.servingSize = 'Serving size is required'
        } else if (Number(ingredient.servingSize) <= 0) {
            newErrors.servingSize = 'Serving size must be greater than 0'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const { calories, protein, carbs, fats } = ingredient
        const calcCals = (Number(protein) * 4) + (Number(carbs) * 4) + (Number(fats) * 9)

        // Warn if calories are wildly different (>20% off)
        if (Math.abs(Number(calories) - calcCals) > (Number(calories) * 0.2)) {
            const dontAsk = localStorage.getItem('dontAsk_calorieWarning')
            if (dontAsk === 'true') {
                saveIngredient()
            } else {
                setCalculatedCals(Math.round(calcCals))
                setShowCalorieWarning(true)
            }
            return
        }

        saveIngredient()
    }

    const saveIngredient = async () => {
        setLoading(true)
        setShowCalorieWarning(false)
        try {
            await ingredientServices.createIngredient({
                name: ingredient.name,
                calories: Number(ingredient.calories),
                protein: Number(ingredient.protein),
                carbs: Number(ingredient.carbs),
                fats: Number(ingredient.fats),
                servingSize: Number(ingredient.servingSize)
            })
            toast.success('Ingredient Created!')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create ingredient')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header with Back Button */}
                <div className="mb-8 flex items-center bg-white p-6 sm:p-8 rounded-2xl shadow-soft-xl border border-slate-100 ring-1 ring-slate-200/50">
                    <button
                        onClick={() => navigate('/')}
                        className="mr-5 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all duration-200 border border-slate-200 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Database</p>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Add New Food</h1>
                        <p className="mt-1.5 text-sm font-medium text-slate-500">
                            Add a custom ingredient to your personal database.
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow-soft-xl rounded-2xl border border-slate-100 ring-1 ring-slate-200/50 overflow-hidden">
                    <div className="p-6 sm:p-8">

                        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Food Name</label>
                                <input
                                    name="name"
                                    value={ingredient.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Greek Yogurt, Protein Powder"
                                    className="focus:ring-emerald-500/50 focus:border-emerald-500 block w-full shadow-sm text-base font-semibold bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 transition-all duration-200 placeholder-slate-400"
                                    style={{
                                        borderColor: errors.name ? '#ef4444' : undefined,
                                        boxShadow: errors.name ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                    }}
                                />
                                <ValidationError show={!!errors.name} message={errors.name} />
                            </div>

                            <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Serving Size</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <input
                                            type="number"
                                            name="servingSize"
                                            value={ingredient.servingSize}
                                            onChange={handleChange}
                                            className="focus:ring-emerald-500/50 focus:border-emerald-500 block w-full pl-4 pr-12 text-base font-semibold bg-white border border-slate-200 text-slate-900 rounded-xl py-3 px-4 transition-all duration-200 placeholder-slate-400"
                                            style={{
                                                borderColor: errors.servingSize ? '#ef4444' : undefined,
                                                boxShadow: errors.servingSize ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                            }}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none border-l border-slate-100 pl-3 my-2">
                                            <span className="text-slate-400 font-bold text-sm">g</span>
                                        </div>
                                    </div>
                                    <ValidationError show={!!errors.servingSize} message={errors.servingSize} />
                                    <p className="mt-2 text-xs font-semibold text-slate-500">Standard serving size</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Calories</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <input
                                            type="number"
                                            name="calories"
                                            value={ingredient.calories}
                                            onChange={handleChange}
                                            className="focus:ring-slate-500/50 focus:border-slate-500 block w-full pl-4 pr-16 text-base font-bold bg-white border border-slate-200 text-slate-900 rounded-xl py-3 px-4 transition-all duration-200 placeholder-slate-400"
                                            style={{
                                                borderColor: errors.calories ? '#ef4444' : undefined,
                                                boxShadow: errors.calories ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                            }}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none border-l border-slate-100 pl-3 my-2">
                                            <span className="text-slate-400 font-bold text-sm">kcal</span>
                                        </div>
                                    </div>
                                    <ValidationError show={!!errors.calories} message={errors.calories} />
                                    <p className="mt-2 text-xs font-semibold text-slate-500">Total calories per serving</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Macronutrients <span className="text-sm font-medium text-slate-500 ml-2">(per serving)</span></h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                        <label className="block text-sm font-bold text-emerald-800 mb-2">Protein</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <input
                                                type="number"
                                                name="protein"
                                                value={ingredient.protein}
                                                onChange={handleChange}
                                                className="focus:ring-emerald-500/50 focus:border-emerald-500 block w-full pl-4 pr-12 text-base font-bold bg-white border border-emerald-200 text-emerald-900 rounded-xl py-3 px-4 transition-all duration-200 tabular-nums"
                                                style={{
                                                    borderColor: errors.protein ? '#ef4444' : undefined,
                                                    boxShadow: errors.protein ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                                }}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none border-l border-emerald-100 pl-3 my-2">
                                                <span className="text-emerald-600 font-bold text-sm">g</span>
                                            </div>
                                        </div>
                                        <ValidationError show={!!errors.protein} message={errors.protein} />
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <label className="block text-sm font-bold text-blue-800 mb-2">Carbs</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <input
                                                type="number"
                                                name="carbs"
                                                value={ingredient.carbs}
                                                onChange={handleChange}
                                                className="focus:ring-blue-500/50 focus:border-blue-500 block w-full pl-4 pr-12 text-base font-bold bg-white border border-blue-200 text-blue-900 rounded-xl py-3 px-4 transition-all duration-200 tabular-nums"
                                                style={{
                                                    borderColor: errors.carbs ? '#ef4444' : undefined,
                                                    boxShadow: errors.carbs ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                                }}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none border-l border-blue-100 pl-3 my-2">
                                                <span className="text-blue-600 font-bold text-sm">g</span>
                                            </div>
                                        </div>
                                        <ValidationError show={!!errors.carbs} message={errors.carbs} />
                                    </div>
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                        <label className="block text-sm font-bold text-amber-800 mb-2">Fats</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <input
                                                type="number"
                                                name="fats"
                                                value={ingredient.fats}
                                                onChange={handleChange}
                                                className="focus:ring-amber-500/50 focus:border-amber-500 block w-full pl-4 pr-12 text-base font-bold bg-white border border-amber-200 text-amber-900 rounded-xl py-3 px-4 transition-all duration-200 tabular-nums"
                                                style={{
                                                    borderColor: errors.fats ? '#ef4444' : undefined,
                                                    boxShadow: errors.fats ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : undefined
                                                }}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none border-l border-amber-100 pl-3 my-2">
                                                <span className="text-amber-600 font-bold text-sm">g</span>
                                            </div>
                                        </div>
                                        <ValidationError show={!!errors.fats} message={errors.fats} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-4 px-4 rounded-xl shadow-soft-md text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : 'Save Custom Ingredient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <ConfirmModal
                isOpen={showCalorieWarning}
                onClose={() => setShowCalorieWarning(false)}
                onConfirm={saveIngredient}
                title="Calorie Mismatch Warning"
                message={`Your macros sum to approximately ${calculatedCals} kcal, but you entered ${ingredient.calories} kcal. Do you want to continue anyway?`}
                confirmText="Continue Anyway"
                showDontAskAgain={true}
                dontAskAgainKey="calorieWarning"
            />
        </div>
    )
}

export default CreateIngredient