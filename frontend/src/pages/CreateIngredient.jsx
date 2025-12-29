import ingredientServices from "../services/ingredientServices";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";


function CreateIngredient() {
    const navigate = useNavigate()
    const [ingredient, setIngredient] = useState({name: '', calories: '', 
        protein: '', carbs: '', fats: '', servingSize: 100})

    const handleChange = (e) => {
    setIngredient({ ...ingredient, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

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
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-8 flex items-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="mr-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Add New Food</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Add a new ingredient to your pantry database.
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-8">

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Food Name</label>
                                <input 
                                    name="name" 
                                    value={ingredient.name} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="e.g. Greek Yogurt" 
                                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Serving Size (g)</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input 
                                            type="number" 
                                            name="servingSize" 
                                            value={ingredient.servingSize} 
                                            onChange={handleChange} 
                                            required 
                                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-12 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">g</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Standard serving size</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Calories</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input 
                                            type="number" 
                                            name="calories" 
                                            value={ingredient.calories} 
                                            onChange={handleChange} 
                                            required 
                                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-12 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">kcal</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Per serving</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-medium text-slate-900 mb-4">Macros (per serving)</h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Protein</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <input 
                                                type="number" 
                                                name="protein" 
                                                value={ingredient.protein} 
                                                onChange={handleChange} 
                                                required 
                                                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-12 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-slate-500 sm:text-sm">g</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Carbs</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <input 
                                                type="number" 
                                                name="carbs" 
                                                value={ingredient.carbs} 
                                                onChange={handleChange} 
                                                required 
                                                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-12 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-slate-500 sm:text-sm">g</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fats</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <input 
                                                type="number" 
                                                name="fats" 
                                                value={ingredient.fats} 
                                                onChange={handleChange} 
                                                required 
                                                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-12 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-slate-500 sm:text-sm">g</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
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