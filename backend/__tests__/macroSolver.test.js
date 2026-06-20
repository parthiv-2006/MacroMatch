const { solveMultipleMeals } = require('../utils/macroSolver')

const makePantryItem = (name, protein, carbs, fats, quantity) => ({
    ingredient: { name, protein, carbs, fats },
    quantity
})

const ITEMS = [
    makePantryItem('Chicken', 31, 0, 3.6, 500),
    makePantryItem('Rice', 5, 45, 1.8, 500),
    makePantryItem('OliveOil', 0, 0, 100, 100),
]

const TARGETS = { protein: 30, carbs: 40, fats: 10 }

describe('solveMultipleMeals', () => {
    test('returns an array', () => {
        expect(Array.isArray(solveMultipleMeals(TARGETS, ITEMS, 3))).toBe(true)
    })

    test('returns at most count solutions', () => {
        const result = solveMultipleMeals(TARGETS, ITEMS, 2)
        expect(result.length).toBeLessThanOrEqual(2)
    })

    test('returns empty array when pantry is empty', () => {
        expect(solveMultipleMeals(TARGETS, [], 3)).toEqual([])
    })

    test('returns empty array when targets are infeasible', () => {
        const result = solveMultipleMeals(
            { protein: 9999, carbs: 9999, fats: 9999 },
            [makePantryItem('Chicken', 31, 0, 3.6, 1)],
            3
        )
        expect(result).toEqual([])
    })

    test('each plan has positive gram values for all included ingredients', () => {
        const result = solveMultipleMeals(TARGETS, ITEMS, 3)
        for (const plan of result) {
            for (const grams of Object.values(plan)) {
                expect(grams).toBeGreaterThan(0)
            }
        }
    })

    test('returned plans are all structurally distinct', () => {
        const result = solveMultipleMeals(TARGETS, ITEMS, 3)
        const signatures = result.map(plan =>
            Object.entries(plan).map(([k, v]) => `${k}:${v}`).sort().join('|')
        )
        expect(new Set(signatures).size).toBe(signatures.length)
    })

    test('ignores pantry items with no ingredient field', () => {
        const mixed = [...ITEMS, { quantity: 100 }]
        expect(() => solveMultipleMeals(TARGETS, mixed, 3)).not.toThrow()
    })

    test('plan keys are strings (ingredient names)', () => {
        const result = solveMultipleMeals(TARGETS, ITEMS, 1)
        if (result.length > 0) {
            for (const key of Object.keys(result[0])) {
                expect(typeof key).toBe('string')
            }
        }
    })
})
