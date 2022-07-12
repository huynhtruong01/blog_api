const mongoose = require('mongoose')

const connectData = async () => {
    const url = process.env.MONGODB_URL

    try {
        await mongoose.connect(`${url}`)
        console.log('Connect DB success...')
    } catch (error) {
        console.log('Connect data error...', error)
    }
}

module.exports = connectData
