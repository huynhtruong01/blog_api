const express = require('express')
const UserController = require('../controllers/UserController')
const router = express.Router()

router.get('/', UserController.getAllUser)
router.get('/search', UserController.searchUser)
router.get('/:id', UserController.getByIdUser)
router.post('/', UserController.addUser)
router.put('/:id', UserController.updateUser)
router.delete('/:id', UserController.deleteUser)
router.post('/follow', UserController.followUser)
router.post('/unfollow', UserController.unfollowUser)
router.get('/get-all-follower/:id', UserController.getAllFollower)
router.get('/get-all-following/:id', UserController.getAllFollowing)

module.exports = router
