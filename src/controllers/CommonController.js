const Blog = require('../models/blogModel')
const Category = require('../models/categoryModel')
const Role = require('../models/roleModel')
const Story = require('../models/storyModel')
const User = require('../models/userModel')

const CommonController = {
    allCountController: async (req, res) => {
        try {
            const countBlog = await Blog.find().countDocuments()
            const countStory = await Story.find().countDocuments()
            const countUser = await User.find().countDocuments()
            const countCategory = await Category.find().countDocuments()
            const countRole = await Role.find().countDocuments()

            res.status(200).json({ countBlog, countStory, countUser, countCategory, countRole })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get all count error' })
        }
    },
}

module.exports = CommonController
