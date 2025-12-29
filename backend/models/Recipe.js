const mongoose = require("mongoose")

const RecipeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    ingredients: [{
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
        name: { type: String, required: true },
        amount: { type: Number, required: true } // grams
    }],
    totalMacros: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    }
}, { timestamps: true })

module.exports = mongoose.model('Recipe', RecipeSchema)