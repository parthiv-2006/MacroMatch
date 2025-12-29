const PantryItem = require("../models/PantryItem")
const Ingredient = require("../models/Ingredient")


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
        }

        res.status(200).json({ success: true, updates, errors })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {getPantryItems, postPantryItem, deletePantryItem, updatePantryItem, consumePantryItems}