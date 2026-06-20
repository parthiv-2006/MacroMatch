jest.mock('../models/PantryItem')
jest.mock('../models/Ingredient')
jest.mock('../models/MealLog')

const { toPantryItemResponse } = require('../controllers/pantryController')

const makeItem = (quantity, threshold) => {
    const plain = threshold !== undefined ? { quantity, threshold } : { quantity }
    return { toObject: () => plain }
}

describe('toPantryItemResponse', () => {
    test('marks item as low stock when quantity < threshold', () => {
        const result = toPantryItemResponse(makeItem(50, 100))
        expect(result.isLowStock).toBe(true)
    })

    test('does not mark item as low stock when quantity equals threshold', () => {
        const result = toPantryItemResponse(makeItem(100, 100))
        expect(result.isLowStock).toBe(false)
    })

    test('does not mark item as low stock when quantity > threshold', () => {
        const result = toPantryItemResponse(makeItem(200, 100))
        expect(result.isLowStock).toBe(false)
    })

    test('defaults threshold to 100 when not set', () => {
        const result = toPantryItemResponse(makeItem(50))
        expect(result.threshold).toBe(100)
    })

    test('quantity < 100 with no threshold set is low stock', () => {
        const result = toPantryItemResponse(makeItem(50))
        expect(result.isLowStock).toBe(true)
    })

    test('quantity >= 100 with no threshold set is not low stock', () => {
        const result = toPantryItemResponse(makeItem(150))
        expect(result.isLowStock).toBe(false)
    })

    test('preserves all other fields from the item', () => {
        const item = { toObject: () => ({ quantity: 50, threshold: 100, name: 'Chicken', _id: 'abc123' }) }
        const result = toPantryItemResponse(item)
        expect(result.name).toBe('Chicken')
        expect(result._id).toBe('abc123')
        expect(result.quantity).toBe(50)
    })

    test('works with a plain object that has no toObject method', () => {
        const result = toPantryItemResponse({ quantity: 50, threshold: 100 })
        expect(result.isLowStock).toBe(true)
        expect(result.threshold).toBe(100)
    })

    test('custom threshold of 0 means nothing is low stock', () => {
        const result = toPantryItemResponse(makeItem(0, 0))
        expect(result.isLowStock).toBe(false)
    })
})
