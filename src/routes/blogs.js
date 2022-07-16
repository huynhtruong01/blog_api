const express = require('express')
const BlogController = require('../controllers/BlogController')
const router = express.Router()

router.get('/', BlogController.getAllBlog)
router.post('/', BlogController.addBlog)
router.post('/by-user', BlogController.getBlogByUser)
router.post('/by-category', BlogController.getBlogByCategory)
router.put('/:id', BlogController.updateBlog)
router.delete('/:id', BlogController.deleteBlog)
router.post('/like-blog', BlogController.likeBlog)
router.post('/unlike-blog', BlogController.unlikeBlog)
router.post('/save-blog', BlogController.savedBlog)
router.post('/unsave-blog', BlogController.unsavedBlog)
router.get('/get-save-blog', BlogController.getAllSavedBlog)

module.exports = router
