const express = require('express')
const AuthController = require('../controllers/AuthController')
const router = express.Router()

router.post('/register', AuthController.register)
router.post('/active', AuthController.activeToken)
router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.get('/refresh-token', AuthController.refreshToken)
router.post('/verify-email-dashboard', AuthController.verifyEmailDashboard)
router.post('/verify-email', AuthController.verifyEmailClient)
router.post('/forgot-password', AuthController.forgotPassword)

module.exports = router
