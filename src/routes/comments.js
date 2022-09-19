const express = require('express')
const CommentController = require('../controllers/CommentController')
const router = express.Router()

router.post('/', CommentController.addComment)

module.exports = router
