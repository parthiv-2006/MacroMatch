import ingredientServices from "../services/ingredientServices";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import ValidationError from "../components/ValidationError";


function CreateIngredient() {
    const navigate = useNavigate()
    const [ingredient, setIngredient] = useState({name: '', calories: '', 
        protein: '', carbs: '', fats: '', servingSize: 100})
    const [errors, setErrors] = useState({})

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
            toast.success('Ingredient Created!')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create ingredient')
        }


    }

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-8 flex items-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="mr-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Add New Food</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Add a new ingredient to your pantry database.
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/10">
                    <div className="p-6 sm:p-8">

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Food Name</label>
                                <input 
                                    name="name" 
                                    value={ingredient.name} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Greek Yogurt" 
                                    className="focus:ring-emerald-500/50 block w-full shadow-sm sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 px-4 transition-all duration-200 placeholder-slate-500"
                                    style={{
                                        borderColor: errors.name ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                        boxShadow: errors.name ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                    }}
                                />
                                <ValidationError show={!!errors.name} message={errors.name} />
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Serving Size (g)</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <input 
                                            type="number" 
                                            name="servingSize" 
                                            value={ingredient.servingSize} 
                                            onChange={handleChange} 
                                            className="focus:ring-emerald-500/50 block w-full pl-4 pr-12 sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 px-4 transition-all duration-200 placeholder-slate-500"
                                            style={{
                                                borderColor: errors.servingSize ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                                boxShadow: errors.servingSize ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                            }}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 sm:text-sm">g</span>
                                        </div>
                                    </div>
                                    <ValidationError show={!!errors.servingSize} message={errors.servingSize} />
                                    <p className="mt-1.5 text-xs text-slate-400">Standard serving size</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Calories</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <input 
                                            type="number" 
                                            name="calories" 
                                            value={ingredient.calories} 
                                            onChange={handleChange} 
                                            className="focus:ring-emerald-500/50 block w-full pl-4 pr-12 sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 px-4 transition-all duration-200 placeholder-slate-500"
                                            style={{
                                                borderColor: errors.calories ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                                boxShadow: errors.calories ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                            }}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 sm:text-sm">kcal</span>
                                        </div>
                                    </div>
                                    <ValidationError show={!!errors.calories} message={errors.calories} />
                                    <p className="mt-1.5 text-xs text-slate-400">Per serving</p>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-sm font-medium text-white mb-4">Macros (per serving)</h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Protein</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <input 
                                                type="number" 
                                                name="protein" 
                                                value={ingredient.protein} 
                                                onChange={handleChange} 
                                                className="focus:ring-emerald-500/50 block w-full pl-4 pr-12 sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 px-4 transition-all duration-200 placeholder-slate-500"
                                                style={{
                                                    borderColor: errors.protein ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                                    boxShadow: errors.protein ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                                }}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-slate-400 sm:text-sm">g</span>
                                            </div>
                                        </div>
                                        <ValidationError show={!!errors.protein} message={errors.protein} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Carbs</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <input 
                                                type="number" 
                                                name="carbs" 
                                                value={ingredient.carbs} 
                                                onChange={handleChange} 
                                                className="focus:ring-emerald-500/50 block w-full pl-4 pr-12 sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 px-4 transition-all duration-200 placeholder-slate-500"
                                                style={{
                                                    borderColor: errors.carbs ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                                    boxShadow: errors.carbs ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                                }}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-slate-400 sm:text-sm">g</span>
                                            </div>
                                        </div>
                                        <ValidationError show={!!errors.carbs} message={errors.carbs} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Fats</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <input 
                                                type="number" 
                                                name="fats" 
                                                value={ingredient.fats} 
                                                onChange={handleChange} 
                                                className="focus:ring-emerald-500/50 block w-full pl-4 pr-12 sm:text-sm bg-white/5 border text-white rounded-xl py-2.5 px-4 transition-all duration-200 placeholder-slate-500"
                                                style={{
                                                    borderColor: errors.fats ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                                    boxShadow: errors.fats ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.5)' : 'none'
                                                }}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-slate-400 sm:text-sm">g</span>
                                            </div>
                                        </div>
                                        <ValidationError show={!!errors.fats} message={errors.fats} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                                >
                                    Save Ingredient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateIngredient