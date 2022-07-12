const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const { generateActiveToken } = require('../config/generateToken')

const AuthController = {
    register: async (req, res) => {
        try {
            // if user registered
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                return res.status(400).json({ message: 'Email or phone already exits' })
            }

            const salt = await bcrypt.genSalt(Number.parseInt(process.env.SALT_ROUND))
            const password = await bcrypt.hash(req.body.password, salt)

            const newUser = new User({
                ...req.body,
                password,
            })

            await newUser.save()

            const activeToken = generateActiveToken(newUser)

            res.status(200).json({
                user: newUser,
                message: 'Register successfully',
                activeToken,
            })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Register failed',
            })
        }
    },
}

module.exports = AuthController
