jest.mock('../models/PantryItem')
jest.mock('../models/Ingredient')

const { solveFromAllIngredients } = require('../controllers/solverController')

const makeIngredient = (name, calories, protein, carbs, fats, servingSize = 100) => ({
    name, calories, protein, carbs, fats, servingSize
})

const INGREDIENTS = [
    makeIngredient('Chicken', 165, 31, 0, 3.6),
    makeIngredient('Rice', 216, 5, 45, 1.8),
    makeIngredient('OliveOil', 884, 0, 0, 100),
]

describe('solveFromAllIngredients', () => {
    test('returns null when targets are infeasible', () => {
        const result = solveFromAllIngredients(
            { protein: 9999, carbs: 9999, fats: 9999 },
            INGREDIENTS
        )
        expect(result).toBeNull()
    })

    test('returns null when ingredient list is empty', () => {
        const result = solveFromAllIngredients({ protein: 30, carbs: 40, fats: 10 }, [])
        expect(result).toBeNull()
    })

    test('returns { plan, totals } for feasible targets', () => {
        const result = solveFromAllIngredients({ protein: 30, carbs: 40, fats: 10 }, INGREDIENTS)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('plan')
        expect(result).toHaveProperty('totals')
    })

    test('totals has calories, protein, carbs, fats fields', () => {
        const result = solveFromAllIngredients({ protein: 30, carbs: 40, fats: 10 }, INGREDIENTS)
        if (result) {
            expect(result.totals).toHaveProperty('calories')
            expect(result.totals).toHaveProperty('protein')
            expect(result.totals).toHaveProperty('carbs')
            expect(result.totals).toHaveProperty('fats')
        }
    })

    test('totals are all non-negative numbers', () => {
        const result = solveFromAllIngredients({ protein: 30, carbs: 40, fats: 10 }, INGREDIENTS)
        if (result) {
            expect(result.totals.calories).toBeGreaterThanOrEqual(0)
            expect(result.totals.protein).toBeGreaterThanOrEqual(0)
            expect(result.totals.carbs).toBeGreaterThanOrEqual(0)
            expect(result.totals.fats).toBeGreaterThanOrEqual(0)
        }
    })

    test('plan keys are valid ingredient names', () => {
        const result = solveFromAllIngredients({ protein: 30, carbs: 40, fats: 10 }, INGREDIENTS)
        if (result) {
            const validNames = new Set(INGREDIENTS.map(i => i.name))
            for (const key of Object.keys(result.plan)) {
                expect(validNames.has(key)).toBe(true)
            }
        }
    })

    test('plan values are positive integers', () => {
        const result = solveFromAllIngredients({ protein: 30, carbs: 40, fats: 10 }, INGREDIENTS)
        if (result) {
            for (const grams of Object.values(result.plan)) {
                expect(Number.isInteger(grams)).toBe(true)
                expect(grams).toBeGreaterThan(0)
            }
        }
    })

    test('respects maxPerIngredient cap', () => {
        const result = solveFromAllIngredients(
            { protein: 30, carbs: 40, fats: 10 },
            INGREDIENTS,
            200 // cap each at 200g
        )
        if (result) {
            for (const grams of Object.values(result.plan)) {
                expect(grams).toBeLessThanOrEqual(200)
            }
        }
    })
})
