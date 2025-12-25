const mongoose = require("mongoose")

const IngredientSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    calories: {type: Number, required: true},
    protein: {type: Number, required: true},
    carbs: {type: Number, required: true},
    fats: {type: Number, required: true},
    servingSize: {type: Number, default: 100}
}, {timestamps: true})

module.exports = mongoose.model('Ingredient', IngredientSchema)