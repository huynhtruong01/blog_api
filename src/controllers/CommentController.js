const Comment = require('../models/commentModel')

const CommentController = {
    addComment: async (req, res) => {
        if (!req.body.user) return res.status(400).json({ message: 'Invalid Authentication' })

        try {
            const { user, content, blogId, blogUserId } = req.body

            const newComment = new Comment({ user, content, blogId, blogUserId })
            await newComment.save()

            res.status(200).json({
                comment: newComment,
                message: 'Add comment successfully',
            })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Get all comment error',
            })
        }
    },
}

module.exports = CommentController
