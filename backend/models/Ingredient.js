const mongoose = require("mongoose")

const IngredientSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    calories: {type: Number, required: true},
    protein: {type: Number, required: true},
    carbs: {type: Number, required: true},
    fats: {type: Number, required: true},
    servingSize: {type: Number, default: 100},
    category: {
        type: String,
        enum: ['protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy', 'spice', 'other'],
        default: 'other'
    },
    flavor: {
        type: String,
        enum: ['savory', 'sweet', 'neutral'],
        default: 'neutral'
    }
}, {timestamps: true})

module.exports = mongoose.model('Ingredient', IngredientSchema)