const Ingredient = require("../models/Ingredient")

const getIngredients = async(req, res) => {
    try {
        const ingredients = await Ingredient.find({}).sort({name: 1})
        res.status(200).json(ingredients)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}

const createIngredient = async(req, res) => {
    let {name, calories, protein, carbs, fats, servingSize} = req.body
    
    // Basic validation
    if (!name || calories == null || protein == null || carbs == null || fats == null) {
        return res.status(400).json({message: "Please fill in all fields"})
    }

    // Default serving size if missing
    if (!servingSize) servingSize = 100

    // NORMALIZE TO 100g if the user entered something else
    if (servingSize !== 100) {
        const ratio = 100 / servingSize
        calories = Math.round(calories * ratio)
        protein = Number((protein * ratio).toFixed(1))
        carbs = Number((carbs * ratio).toFixed(1))
        fats = Number((fats * ratio).toFixed(1))
        servingSize = 100 // Now it's standardized
    }
    
    try {
        // Case-insensitive check
        const ingredientExists = await Ingredient.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        })
        
        if (ingredientExists) {
            return res.status(400).json({message: "Ingredient already exists"})
        }

        const newIngredient = await Ingredient.create({
            name, calories, protein, carbs, fats, servingSize
        })
        res.status(201).json(newIngredient)

    } catch (err) {
        res.status(500).json({message: err.message})
    }
}


module.exports = {getIngredients, createIngredient}