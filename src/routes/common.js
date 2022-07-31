const express = require('express')
const CommonController = require('../controllers/CommonController')
const router = express.Router()

router.get('/count', CommonController.allCountController)

module.exports = router
