const solver = require("javascript-lp-solver")

const solveMultipleMeals = (targets, pantryItems, count = 3) => {
    const solutions = []
    const seen = new Set()

    // Try multiple iterations with randomized weights to find different solutions
    for (let i = 0; i < count * 5; i++) {
        const model = {
            optimize: "cost",
            opType: "min",
            constraints: {
                protein: {min: targets.protein - 5, max: targets.protein + 5},
                carbs: {min: targets.carbs - 5, max: targets.carbs + 5},
                fats: {min: targets.fats - 5, max: targets.fats + 5}
            },
            variables: {}
        }

        pantryItems.forEach(item => {
            if (!item.ingredient) return
            const p = item.ingredient.protein / 100
            const c = item.ingredient.carbs / 100
            const f = item.ingredient.fats / 100
            
            const varName = item.ingredient.name

            // Randomize cost (0.5 to 1.5) to encourage variety in solutions
            // This makes the solver prefer different ingredients in each run
            const randomCost = 0.5 + Math.random()

            model.variables[varName] = {
                protein: p,
                carbs: c,
                fats: f,
                cost: randomCost,
                [varName]: 1 // Constraint for max quantity
            }
            model.constraints[varName] = {max: item.quantity}
        })

        const result = solver.Solve(model)
   
        if (result.feasible) {
            const mealPlan = {}
            // Create a signature to check for duplicates (sorted keys + values)
            const items = []
            
            Object.keys(result).forEach(key => {
                if (key !== 'feasible' && key !== 'result' && key !== 'bounded') {
                    const amount = Math.round(result[key])
                    if (amount > 0) {
                        mealPlan[key] = amount
                        items.push(`${key}:${amount}`)
                    }
                }
            })
            
            items.sort()
            const signature = items.join('|')

            if (Object.keys(mealPlan).length > 0 && !seen.has(signature)) {
                solutions.push(mealPlan)
                seen.add(signature)
            }
        }

        if (solutions.length >= count) break
    }

    return solutions
}

module.exports = {solveMultipleMeals}