const mongoose = require('mongoose')

const blog = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            minLength: 100,
            trim: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
            minLength: 100,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        likes: [
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

blog.index({ title: 'text' })
const Blog = mongoose.model('Blog', blog)
Blog.createIndexes({ title: 'text' })

module.exports = Blog
