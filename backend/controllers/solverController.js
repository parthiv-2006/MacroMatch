const PantryItem = require("../models/PantryItem")
const { solveMeal } = require("../utils/macroSolver")

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

        const result = solveMeal(targets, pantryItems)

        if (!result.feasible) {
            return res.status(400).json({message: "No solution found. Try adjusting your targets or adding more variety to your pantry." })
        }

        const mealPlan = {}
        Object.keys(result).forEach(key => {
            if (key !== 'feasible' && key !== 'result' && key !== 'bounded') {
                // Round to nearest gram for cleanliness
                mealPlan[key] = Math.round(result[key])
            }
        })

        res.status(200).json({success: true, mealPlan})

    } catch (err) {
        console.error(err)
        res.status(500).json({message: "Solver Error" + err.message})
    }
}

module.exports = { generateMeal }