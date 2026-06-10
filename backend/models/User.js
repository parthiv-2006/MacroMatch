const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    goals: {
        calories: { type: Number, default: 2200, min: 0 },
        protein:  { type: Number, default: 140,  min: 0 },
        carbs:    { type: Number, default: 220,  min: 0 },
        fats:     { type: Number, default: 70,   min: 0 }
    }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)