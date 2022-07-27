const mongoose = require('mongoose')

const role = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        userList: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
)

role.index({ name: 'text' })
const Role = mongoose.model('Role', role)
Role.createIndexes({ name: 'text' })

module.exports = Role
