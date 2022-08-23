const express = require('express')
const SaveBlogController = require('../controllers/SaveBlogController')
const router = express.Router()

router.get('/', SaveBlogController.getAllSavedBlog)

module.exports = router
