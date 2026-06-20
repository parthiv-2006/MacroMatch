const { errorHandler } = require('../middleware/errorMiddleware')

const makeRes = (statusCode) => ({
    statusCode,
    _status: null,
    _json: null,
    status(code) { this._status = code; return this },
    json(data) { this._json = data; return this }
})

const ERR = Object.assign(new Error('Something broke'), {
    stack: 'Error: Something broke\n    at Object.<anonymous> (test.js:1:1)'
})

describe('errorHandler', () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
        process.env.NODE_ENV = originalEnv
    })

    test('uses the existing statusCode from the response object', () => {
        const res = makeRes(404)
        errorHandler(ERR, {}, res, () => {})
        expect(res._status).toBe(404)
    })

    test('defaults to 500 when statusCode is falsy', () => {
        const res = makeRes(0)
        errorHandler(ERR, {}, res, () => {})
        expect(res._status).toBe(500)
    })

    test('uses 400 when response statusCode is 400', () => {
        const res = makeRes(400)
        errorHandler(ERR, {}, res, () => {})
        expect(res._status).toBe(400)
    })

    test('always includes the error message in the response body', () => {
        const res = makeRes(500)
        errorHandler(ERR, {}, res, () => {})
        expect(res._json.message).toBe('Something broke')
    })

    test('includes stack trace when NODE_ENV is development', () => {
        process.env.NODE_ENV = 'development'
        const res = makeRes(500)
        errorHandler(ERR, {}, res, () => {})
        expect(res._json.stack).not.toBeNull()
        expect(res._json.stack).toContain('Something broke')
    })

    test('sets stack to null when NODE_ENV is production', () => {
        process.env.NODE_ENV = 'production'
        const res = makeRes(500)
        errorHandler(ERR, {}, res, () => {})
        expect(res._json.stack).toBeNull()
    })

    test('includes stack trace when NODE_ENV is unset', () => {
        delete process.env.NODE_ENV
        const res = makeRes(500)
        errorHandler(ERR, {}, res, () => {})
        expect(res._json.stack).not.toBeNull()
    })
})
