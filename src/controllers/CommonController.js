const Blog = require('../models/blogModel')
const Category = require('../models/categoryModel')
const Role = require('../models/roleModel')
const Story = require('../models/storyModel')
const User = require('../models/userModel')
const { getYear, getMonthText, getYearText } = require('../utils/common')

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
    getTotalNumberDataBlogChart: async (req, res) => {
        try {
            const month = {
                jan: 0,
                feb: 0,
                mar: 0,
                apr: 0,
                may: 0,
                jun: 0,
                jul: 0,
                aug: 0,
                sep: 0,
                oct: 0,
                nov: 0,
                dec: 0,
            }

            const year = {
                y2022: 0,
                y2023: 0,
                y2024: 0,
            }

            const blogs = await Blog.find()

            if (req.body.type === 'month') {
                const blogsByYear = blogs
                    .map((blog) => ({
                        ...blog,
                        year: getYear(blog.createdAt),
                        month: getMonthText(blog.createdAt),
                    }))
                    .filter((blog) => blog.year === req.body.year)

                const cloneMonth = { ...month }

                for (const blog of blogsByYear) {
                    if (!cloneMonth[blog.month]) {
                        cloneMonth[blog.month] = 1
                    } else {
                        cloneMonth[blog.month] += 1
                    }
                }

                const arrMonthData = Object.values(cloneMonth)

                return res.status(200).json({ data: arrMonthData })
            }

            if (req.body.type === 'year') {
                const blogsYear = blogs.map((blog) => ({
                    ...blog,
                    year: getYearText(blog.createdAt),
                }))

                const cloneYear = { ...year }

                for (const blog of blogsYear) {
                    if (!cloneYear[blog.year]) {
                        cloneYear[blog.year] = 1
                    } else {
                        cloneYear[blog.year] += 1
                    }
                }

                const arrYearData = Object.values(cloneYear)

                return res.status(200).json({ data: arrYearData })
            }
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get total data blog failed' })
        }
    },
    topLikeBlog: async (req, res) => {
        try {
            const blogs = await Blog.find()

            const newBlogs = [...blogs]
                .map((blog) => {
                    const newBlog = blog._doc
                    return { ...newBlog, likes: newBlog.likes.length }
                })
                .sort((a, b) => a - b)

            res.status(200).json({ data: newBlogs })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get blog list top failed' })
        }
    },
}

module.exports = CommonController
