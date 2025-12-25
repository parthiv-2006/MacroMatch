const mongoose = require("mongoose")

const PantryItemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    ingredient: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Ingredient' },
    quantity: { type: Number, required: true, min: 0 }
}, { timestamps: true })

// Ensure a user can only have one entry per ingredient
PantryItemSchema.index({ user: 1, ingredient: 1 }, { unique: true })

module.exports = mongoose.model('PantryItem', PantryItemSchema)