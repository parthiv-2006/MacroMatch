const mongoose = require("mongoose")

const MealLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: Date, default: Date.now },
    items: [{
        ingredientName: { type: String, required: true },
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
        amount: { type: Number, required: true }, // Amount consumed in grams/units
        macros: { // Macros for this specific portion
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number
        }
    }],
    totalMacros: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    }
}, { timestamps: true })

module.exports = mongoose.model('MealLog', MealLogSchema)