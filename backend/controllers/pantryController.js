const PantryItem = require("../models/PantryItem")


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

module.exports = {getPantryItems, postPantryItem, deletePantryItem, updatePantryItem}