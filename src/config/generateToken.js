const jwt = require('jsonwebtoken')

const generateActiveToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVE_TOKEN_SECRET, { expiresIn: '5m' })
}

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = (payload, res) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
    res.cookie('refreshToken', refreshToken, {
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        path: '/api/auth/refresh-token',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    })

    return refreshToken
}

module.exports = { generateActiveToken, generateAccessToken, generateRefreshToken }
