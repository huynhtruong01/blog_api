const mongoose = require('mongoose')

const user = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            lowercase: true,
        },
        avatar: {
            type: String,
            default: 'http://cdn.onlinewebfonts.com/svg/img_569204.png',
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
            trim: true,
        },
        role: {
            type: String,
            default: 'user',
            lowercase: true,
        },
        rf_token: { type: String, select: false },
    },
    {
        timestamps: true,
    }
)

user.index({ fullname: 'text' })
const User = mongoose.model('User', user)
User.createIndexes({ fullname: 'text' })

module.exports = User
