const PantryItem = require("../models/PantryItem")
const Ingredient = require("../models/Ingredient")
const MealLog = require("../models/MealLog")


const getPantryItems = async(req, res) => {
    try {
        const pantryItems = await PantryItem.find({user: req.user.id}).populate('ingredient')
        res.status(200).json(pantryItems)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

const postPantryItem = async(req, res) => {
    const { ingredientId, quantity} = req.body

    if (!ingredientId || quantity == undefined) {
        return res.status(400).json({message: "Please complete all fields"})
    }

    try {
        // Check if item already exists for this user
        const existingItem = await PantryItem.findOne({ 
            user: req.user.id, 
            ingredient: ingredientId 
        })

        if (existingItem) {
            return res.status(400).json({ message: "Ingredient already in pantry. Please update the quantity instead." })
        }

        const newItem = await PantryItem.create({
            user: req.user.id,
            ingredient: ingredientId,
            quantity
        })

        // Populate immediately so frontend can display it
        const populatedItem = await newItem.populate('ingredient')
        
        res.status(201).json(populatedItem)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updatePantryItem = async(req, res) => {
    const { id } = req.params
    const { quantity } = req.body

    if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ message: "Please provide a valid quantity" })
    }

    try {
        // Ensure user owns the item they are updating
        const updatedItem = await PantryItem.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { quantity },
            { new: true } // Return the updated document
        ).populate('ingredient')

        if (!updatedItem) {
            return res.status(404).json({ message: "Pantry item not found" })
        }

        res.status(200).json(updatedItem)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const deletePantryItem = async(req, res) => {
    const { id } = req.params

    try {
        const deletedItem = await PantryItem.findOneAndDelete({ _id: id, user: req.user.id })

        if (!deletedItem) {
            return res.status(404).json({ message: "Pantry item not found" })
        }

        res.status(200).json({ id: deletedItem._id })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const consumePantryItems = async (req, res) => {
    const { ingredients } = req.body // { "Chicken": 100, "Rice": 50 }

    if (!ingredients || Object.keys(ingredients).length === 0) {
        return res.status(400).json({ message: "No ingredients provided" })
    }

    try {
        const updates = []
        const errors = []
        
        // For Meal Logging
        const mealItems = []
        const mealTotalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 }

        for (const [name, amountToConsume] of Object.entries(ingredients)) {
            // 1. Find Ingredient ID
            const ingredientDoc = await Ingredient.findOne({ name })
            if (!ingredientDoc) {
                errors.push(`Ingredient '${name}' not found in database`)
                continue
            }

            // 2. Find Pantry Item
            const pantryItem = await PantryItem.findOne({ 
                user: req.user.id, 
                ingredient: ingredientDoc._id 
            })

            if (!pantryItem) {
                errors.push(`'${name}' not found in your pantry`)
                continue
            }

            // 3. Calculate new quantity
            const newQuantity = pantryItem.quantity - amountToConsume

            if (newQuantity <= 0.1) { // Use small threshold for float precision
                // Remove item
                await PantryItem.findByIdAndDelete(pantryItem._id)
                updates.push({ name, status: "Removed", remaining: 0 })
            } else {
                // Update item
                pantryItem.quantity = newQuantity
                await pantryItem.save()
                updates.push({ name, status: "Updated", remaining: newQuantity })
            }

            // 4. Calculate Macros for Log
            const ratio = amountToConsume / ingredientDoc.servingSize
            const itemMacros = {
                calories: ingredientDoc.calories * ratio,
                protein: ingredientDoc.protein * ratio,
                carbs: ingredientDoc.carbs * ratio,
                fats: ingredientDoc.fats * ratio
            }

            mealItems.push({
                ingredientName: name,
                ingredient: ingredientDoc._id,
                amount: amountToConsume,
                macros: itemMacros
            })

            mealTotalMacros.calories += itemMacros.calories
            mealTotalMacros.protein += itemMacros.protein
            mealTotalMacros.carbs += itemMacros.carbs
            mealTotalMacros.fats += itemMacros.fats
        }

        // 5. Create Meal Log if items were consumed
        if (mealItems.length > 0) {
            await MealLog.create({
                user: req.user.id,
                items: mealItems,
                totalMacros: mealTotalMacros
            })
        }

        res.status(200).json({ success: true, updates, errors })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getMealHistory = async (req, res) => {
    try {
        const history = await MealLog.find({ user: req.user.id }).sort({ date: -1 })
        res.status(200).json(history)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {getPantryItems, postPantryItem, deletePantryItem, updatePantryItem, consumePantryItems, getMealHistory}