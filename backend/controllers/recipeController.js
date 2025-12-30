const Recipe = require("../models/Recipe")
const Ingredient = require("../models/Ingredient")

const createRecipe = async (req, res) => {
    const { name, ingredients } = req.body // ingredients: { "Chicken": 100, "Rice": 50 }

    if (!name || !ingredients || Object.keys(ingredients).length === 0) {
        return res.status(400).json({ message: "Please provide a name and ingredients" })
    }

    try {
        const recipeIngredients = []
        const totalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 }

        for (const [ingredientName, amount] of Object.entries(ingredients)) {
            const ingredientDoc = await Ingredient.findOne({ name: ingredientName })
            
            if (!ingredientDoc) {
                return res.status(400).json({ message: `Ingredient '${ingredientName}' not found` })
            }

            const ratio = amount / ingredientDoc.servingSize
            const itemMacros = {
                calories: ingredientDoc.calories * ratio,
                protein: ingredientDoc.protein * ratio,
                carbs: ingredientDoc.carbs * ratio,
                fats: ingredientDoc.fats * ratio
            }

            recipeIngredients.push({
                ingredient: ingredientDoc._id,
                name: ingredientName,
                amount: amount
            })

            totalMacros.calories += itemMacros.calories
            totalMacros.protein += itemMacros.protein
            totalMacros.carbs += itemMacros.carbs
            totalMacros.fats += itemMacros.fats
        }

        const recipe = await Recipe.create({
            user: req.user.id,
            name,
            ingredients: recipeIngredients,
            totalMacros
        })

        res.status(201).json(recipe)

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json(recipes)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.id })
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        res.status(200).json({ id: recipe._id })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateRecipeName = async (req, res) => {
    const { name } = req.body

    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Please provide a recipe name" })
    }

    try {
        const updated = await Recipe.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name: name.trim() },
            { new: true }
        )

        if (!updated) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        res.status(200).json(updated)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { createRecipe, getRecipes, deleteRecipe, updateRecipeName }