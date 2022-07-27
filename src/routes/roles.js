const express = require('express')
const RoleController = require('../controllers/RoleController')
const router = express.Router()

router.get('/', RoleController.getAllRole)
router.get('/search', RoleController.searchRole)
router.get('/:id', RoleController.getByIdRole)
router.post('/', RoleController.addRole)
router.put('/:id', RoleController.updateRole)
router.delete('/:id', RoleController.deleteRole)

module.exports = router
