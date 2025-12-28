const solver = require("javascript-lp-solver")

const solveMeal = (targets, pantryItems) => {
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
        const k = item.ingredient.calories / 100

        const varName = item.ingredient.name

        model.variables[varName] = {
            protein: p,
            carbs: c,
            fats: f,
            calories: k,
            cost: 1,

            [varName]: 1
        }
        model.constraints[varName] = {max: item.quantity}
    })
    const result = solver.Solve(model)
   
    return result

}

module.exports = {solveMeal}