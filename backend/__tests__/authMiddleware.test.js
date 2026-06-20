jest.mock('jsonwebtoken')
jest.mock('../models/User')

const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/authMiddleware')

const makeReqRes = (authHeader) => {
    const req = { headers: authHeader ? { authorization: authHeader } : {} }
    const res = {
        _status: null,
        _json: null,
        status(code) { this._status = code; return this },
        json(data) { this._json = data; return this }
    }
    return { req, res }
}

describe('protect middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.JWT_SECRET = 'testsecret'
    })

    test('returns 401 with "no token" when Authorization header is absent', async () => {
        const { req, res } = makeReqRes(null)
        const next = jest.fn()
        await protect(req, res, next)
        expect(res._status).toBe(401)
        expect(res._json.message).toBe('Not authorized, no token')
        expect(next).not.toHaveBeenCalled()
    })

    test('returns 401 with "no token" when header does not start with Bearer', async () => {
        const { req, res } = makeReqRes('Basic sometoken')
        const next = jest.fn()
        await protect(req, res, next)
        expect(res._status).toBe(401)
        expect(res._json.message).toBe('Not authorized, no token')
        expect(next).not.toHaveBeenCalled()
    })

    test('returns 401 with "token failed" when jwt.verify throws', async () => {
        jwt.verify.mockImplementation(() => { throw new Error('invalid signature') })
        const { req, res } = makeReqRes('Bearer badtoken')
        const next = jest.fn()
        await protect(req, res, next)
        expect(res._status).toBe(401)
        expect(res._json.message).toBe('Not authorized, token failed')
        expect(next).not.toHaveBeenCalled()
    })

    test('returns 401 with "user not found" when DB returns null', async () => {
        jwt.verify.mockReturnValue({ id: 'user123' })
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) })
        const { req, res } = makeReqRes('Bearer validtoken')
        const next = jest.fn()
        await protect(req, res, next)
        expect(res._status).toBe(401)
        expect(res._json.message).toBe('Not authorized, user not found')
        expect(next).not.toHaveBeenCalled()
    })

    test('calls next() and attaches req.user when token and user are valid', async () => {
        const mockUser = { _id: 'user123', name: 'Parthiv', email: 'parthiv@test.com' }
        jwt.verify.mockReturnValue({ id: 'user123' })
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) })
        const { req, res } = makeReqRes('Bearer validtoken')
        const next = jest.fn()
        await protect(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.user).toEqual(mockUser)
    })

    test('calls User.findById with the id from the decoded token', async () => {
        const mockUser = { _id: 'abc', name: 'Test' }
        jwt.verify.mockReturnValue({ id: 'abc' })
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) })
        const { req, res } = makeReqRes('Bearer tok')
        await protect(req, res, jest.fn())
        expect(User.findById).toHaveBeenCalledWith('abc')
    })
})
