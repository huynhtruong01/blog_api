const express = require('express')
const CommonController = require('../controllers/CommonController')
const router = express.Router()

router.get('/count', CommonController.allCountController)
router.post('/data-blog-chart', CommonController.getTotalNumberDataBlogChart)
router.get('/top-like-blog', CommonController.topLikeBlog)

module.exports = router
