const express = require('express')
const StoryController = require('../controllers/storyController')
const router = express.Router()

router.get('/', StoryController.getAllStory)
router.get('/search', StoryController.searchStory)
router.get('/:id', StoryController.getByIdStory)
router.post('/', StoryController.addStory)
router.put('/:id', StoryController.updateStory)
router.delete('/:id', StoryController.deleteStory)

module.exports = router
