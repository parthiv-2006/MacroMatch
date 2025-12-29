const PantryItem = require("../models/PantryItem")
const Ingredient = require("../models/Ingredient")
const { solveMultipleMeals } = require("../utils/macroSolver")
const solver = require("javascript-lp-solver")

const solveFromAllIngredients = (targets, ingredients, maxPerIngredient = 400) => {
    const model = {
        optimize: "cost",
        opType: "min",
        constraints: {
            protein: { min: targets.protein - 5, max: targets.protein + 5 },
            carbs: { min: targets.carbs - 5, max: targets.carbs + 5 },
            fats: { min: targets.fats - 5, max: targets.fats + 5 }
        },
        variables: {}
    }

    ingredients.forEach(ing => {
        const varName = ing.name
        const ratio = 1 / ing.servingSize
        model.variables[varName] = {
            protein: ing.protein * ratio,
            carbs: ing.carbs * ratio,
            fats: ing.fats * ratio,
            cost: 0.5 + Math.random(),
            [varName]: 1
        }
        model.constraints[varName] = { max: maxPerIngredient }
    })

    const result = solver.Solve(model)

    if (!result.feasible) return null

    const plan = {}
    Object.keys(result).forEach(key => {
        if (key === "feasible" || key === "result" || key === "bounded") return
        const grams = Math.max(0, Math.round(result[key]))
        if (grams > 0) plan[key] = grams
    })

    if (Object.keys(plan).length === 0) return null

    const ingredientMap = new Map(ingredients.map(ing => [ing.name, ing]))
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 }

    Object.entries(plan).forEach(([name, grams]) => {
        const ing = ingredientMap.get(name)
        if (!ing) return
        const portionRatio = grams / ing.servingSize
        totals.calories += ing.calories * portionRatio
        totals.protein += ing.protein * portionRatio
        totals.carbs += ing.carbs * portionRatio
        totals.fats += ing.fats * portionRatio
    })

    return { plan, totals }
}

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

const generateReverseMeal = async (req, res) => {
    const { targetProtein, targetCarbs, targetFats } = req.body

    if (targetProtein == null || targetCarbs == null || targetFats == null) {
        return res.status(400).json({ message: "Please provide all target macros" })
    }

    try {
        const ingredients = await Ingredient.find({}).lean()

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ message: "No ingredients available in database" })
        }

        const targets = {
            protein: Number(targetProtein),
            carbs: Number(targetCarbs),
            fats: Number(targetFats)
        }

        const solution = solveFromAllIngredients(targets, ingredients)

        if (!solution) {
            return res.status(400).json({ message: "No solution found with current ingredient library" })
        }

        const pantryItems = await PantryItem.find({ user: req.user.id }).populate('ingredient')
        const pantryMap = new Map()
        pantryItems.forEach(item => {
            if (item.ingredient && item.ingredient.name) {
                pantryMap.set(item.ingredient.name, item.quantity)
            }
        })

        const shoppingList = []
        const pantryUsage = []

        Object.entries(solution.plan).forEach(([name, needed]) => {
            const available = pantryMap.get(name) || 0
            const fromPantry = Math.min(needed, available)
            const shortfall = Math.max(0, needed - available)

            pantryUsage.push({ name, needed, available, fromPantry, shortfall })
            if (shortfall > 0) shoppingList.push({ name, amount: shortfall })
        })

        res.status(200).json({
            success: true,
            plan: solution.plan,
            macros: {
                target: targets,
                achieved: {
                    calories: Number(solution.totals.calories.toFixed(1)),
                    protein: Number(solution.totals.protein.toFixed(1)),
                    carbs: Number(solution.totals.carbs.toFixed(1)),
                    fats: Number(solution.totals.fats.toFixed(1))
                }
            },
            pantryUsage,
            shoppingList
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Solver Error: " + err.message })
    }
}

module.exports = { generateMeal, generateReverseMeal }