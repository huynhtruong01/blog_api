const mongoose = require('mongoose')

const comment = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        blogId: {
            type: mongoose.Types.ObjectId,
        },
        blogUserId: {
            type: mongoose.Types.ObjectId,
        },
        content: {
            type: String,
            required: true,
        },
        replyCM: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        replyUser: {
            type: mongoose.Types.ObjectId,
            ref: 'Comment',
        },
    },
    {
        timestamps: true,
    }
)

const Comment = mongoose.model('Comment', comment)

module.exports = Comment
