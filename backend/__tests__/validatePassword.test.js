const { validatePassword } = require('../controllers/userController')

describe('validatePassword', () => {
    test('returns error for non-string input (number)', () => {
        expect(validatePassword(123)).toBe('Password is required')
    })

    test('returns error for null', () => {
        expect(validatePassword(null)).toBe('Password is required')
    })

    test('returns error for undefined', () => {
        expect(validatePassword(undefined)).toBe('Password is required')
    })

    test('returns error when password is too short (< 8 chars)', () => {
        expect(validatePassword('Ab1!')).toBe('Password must be 8-16 characters')
        expect(validatePassword('Ab1!xyz')).toBe('Password must be 8-16 characters')
    })

    test('returns error when password is too long (> 16 chars)', () => {
        expect(validatePassword('Ab1!xyzxyzxyzxyz1')).toBe('Password must be 8-16 characters')
    })

    test('returns error when missing a lowercase letter', () => {
        expect(validatePassword('ABCDEF1!')).toBe('Password must contain a lowercase letter')
    })

    test('returns error when missing an uppercase letter', () => {
        expect(validatePassword('abcdef1!')).toBe('Password must contain an uppercase letter')
    })

    test('returns error when missing a number', () => {
        expect(validatePassword('Abcdefg!')).toBe('Password must contain a number')
    })

    test('returns error when missing a special character', () => {
        expect(validatePassword('Abcdef12')).toBe('Password must contain a special character')
    })

    test('returns null for a valid password (exactly 8 chars)', () => {
        expect(validatePassword('Abc123!@')).toBeNull()
    })

    test('returns null for a valid password (exactly 16 chars)', () => {
        expect(validatePassword('Abcdef123456!@#$')).toBeNull()
    })

    test('returns null for a valid password with various special chars', () => {
        expect(validatePassword('ValidP@ss1')).toBeNull()
        expect(validatePassword('Secure#99')).toBeNull()
    })
})
