const express = require('express')
const CategoryController = require('../controllers/CategoryController')
const router = express.Router()

router.get('/', CategoryController.getAllCategory)
router.get('/search', CategoryController.searchCategory)
router.get('/:id', CategoryController.getByIdCategory)
router.post('/', CategoryController.addCategory)
router.put('/:id', CategoryController.updateCategory)
router.delete('/:id', CategoryController.deleteCategory)

module.exports = router
