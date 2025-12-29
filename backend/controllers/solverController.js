const PantryItem = require("../models/PantryItem")
const { solveMultipleMeals } = require("../utils/macroSolver")

const generateMeal = async(req, res) => {
    const { targetProtein, targetCarbs, targetFats } = req.body

    if (!targetProtein || !targetCarbs || !targetFats) {
        return res.status(400).json({message: "Please provide all target macros"})
    }

    try {
        const pantryItems = await PantryItem.find({user: req.user.id}).populate('ingredient')

        if (!pantryItems || pantryItems.length === 0) {
            return res.status(400).json({message: "Your pantry is empty!"})
        }

        const targets = {
            protein: Number(targetProtein),
            carbs: Number(targetCarbs),
            fats: Number(targetFats)
        }

        const mealPlans = solveMultipleMeals(targets, pantryItems, 3)

        if (mealPlans.length === 0) {
            return res.status(400).json({message: "No solution found. Try adjusting your targets or adding more variety to your pantry." })
        }

        res.status(200).json({success: true, mealPlans})

    } catch (err) {
        console.error(err)
        res.status(500).json({message: "Solver Error: " + err.message})
    }
}

module.exports = { generateMeal }