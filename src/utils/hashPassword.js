const bcrypt = require('bcrypt')

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(Number.parseInt(process.env.SALT_ROUND))
        const passwordHashed = await bcrypt.hash(password, salt)

        return passwordHashed
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = { hashPassword }
