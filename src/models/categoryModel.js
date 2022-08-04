const mongoose = require('mongoose')

const category = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        blogList: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Blog',
            },
        ],
    },
    {
        timestamps: true,
    }
)

category.index({ name: 'text' })
const Category = mongoose.model('Category', category)
Category.createIndexes({ name: 'text' })

module.exports = Category
