const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const ApiFeatures = require('../utils/apiFeatures')
const pagination = require('../utils/pagination')

const BlogController = {
    // create blog
    addBlog: async (req, res) => {
        try {
            const newBlog = new Blog({
                ...req.body,
            })

            await newBlog.save()

            res.status(200).json({ blog: newBlog, message: 'Add blog successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Add blog failed' })
        }
    },
    // get all blog
    getAllBlog: async (req, res) => {
        const { limit } = pagination(req.query)

        try {
            const features = new ApiFeatures(
                Blog.find()
                    .populate({
                        path: 'user',
                        select: '-password',
                    })
                    .populate('category')
                    .populate({
                        path: 'likes',
                        select: '-password',
                    }),
                req.query
            )
                .pagination()
                .search()
                .sort()
                .filter()

            const blogs = await Promise.allSettled([
                features.query,
                Blog.count(features.queryString),
            ])

            let totalCount = 0
            const data = blogs[0].status === 'fulfilled' ? blogs[0].value : []

            if (req.query.search) {
                const count = await Blog.aggregate([
                    {
                        $match: {
                            $text: {
                                $search: req.query.search,
                            },
                        },
                    },
                    {
                        $count: 'count',
                    },
                    {
                        $project: {
                            count: 1,
                        },
                    },
                ])

                totalCount = Math.ceil(count[0]?.['count'] / limit) || 0
            } else {
                const count = blogs[1].status === 'fulfilled' ? blogs[1].value : 0
                totalCount = Math.ceil(count / limit) || 0
            }

            // console.log(data, totalCount)

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get all blog failed' })
        }
    },
    // get by id blog
    getByIdBlog: async (req, res) => {
        try {
            const blog = await Blog.findById({ _id: req.params.id })
                .populate({
                    path: 'user',
                    select: '-password',
                })
                .populate('category')

            if (!blog) {
                return res.status(404).json({ message: 'Not found this blog' })
            }

            res.status(200).json({ data: blog })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get by id blog failed' })
        }
    },
    // get by user
    getBlogByUser: async (req, res) => {
        const { limit } = pagination(req.body)

        try {
            // const user = await Blog.findOne({ user: req.body.id })
            // if (!user) {
            //     return res.status(404).json({ message: 'Not found this user' })
            // }

            const features = new ApiFeatures(Blog.find({ user: req.body.id }), req.body)
                .pagination()
                .search()
                .sort()
                .filter()

            const blogs = await Promise.allSettled([
                features.query,
                Blog.count(features.queryString),
            ])

            let totalCount = 0
            const data = blogs[0].status === 'fulfilled' ? blogs[0].value : []

            if (req.body.search) {
                const count = await Blog.aggregate([
                    {
                        $match: {
                            $text: {
                                $search: req.body.search,
                            },
                        },
                    },
                    {
                        $count: 'count',
                    },
                    {
                        $project: {
                            count: 1,
                        },
                    },
                ])

                // console.log(count[0].count / limit, limit)

                totalCount = Math.ceil(count[0]?.['count'] / limit) || 0
            } else {
                const count = blogs[1].status === 'fulfilled' ? blogs[1].value : 0
                totalCount = Math.ceil(count / limit) || 0
            }

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get blog by user failed' })
        }
    },
    // get by category
    getBlogByCategory: async (req, res) => {
        const { limit } = pagination(req.body)

        try {
            // const category = await Blog.findOne({ category: req.body.id })
            // if (!category) {
            //     return res.status(404).json({ message: 'Not found this category' })
            // }

            const features = new ApiFeatures(Blog.find({ category: req.body.id }), req.body)
                .pagination()
                .search()
                .sort()
                .filter()

            const blogs = await Promise.allSettled([
                features.query,
                Blog.count(features.queryString),
            ])

            let totalCount = 0
            const data = blogs[0].status === 'fulfilled' ? blogs[0].value : []

            if (req.body.search) {
                const count = await Blog.aggregate([
                    {
                        $match: {
                            $text: {
                                $search: req.body.search,
                            },
                        },
                    },
                    {
                        $count: 'count',
                    },
                    {
                        $project: {
                            count: 1,
                        },
                    },
                ])

                totalCount = Math.ceil(count[0]?.['count'] / limit) || 0
            } else {
                const count = blogs[1].status === 'fulfilled' ? blogs[1].value : 0
                totalCount = Math.ceil(count / limit) || 0
            }

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get blog by user failed' })
        }
    },
    // update blog
    updateBlog: async (req, res) => {
        try {
            const blog = await Blog.findById({ _id: req.params.id })
            if (!blog) {
                return res.status(404).json({ message: 'Not found this blog' })
            }

            await Blog.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    $set: {
                        ...req.body,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Update blog successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Update blog failed' })
        }
    },
    // delete blog
    deleteBlog: async (req, res) => {
        try {
            const blog = await Blog.findById({ _id: req.params.id })
            if (!blog) {
                return res.status(404).json({ message: 'Not found this blog' })
            }

            await Blog.findByIdAndDelete({ _id: req.params.id })

            res.status(200).json({ message: 'Delete blog successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Delete blog failed' })
        }
    },
    // like blog
    likeBlog: async (req, res) => {
        try {
            // check blog exits
            const blog = await Blog.findById({ _id: req.body.blogId })
            if (!blog) {
                return res.status(404).json({ message: 'Không tìm thấy bài viết này' })
            }

            // push user id to likes
            const likeBlog = await Blog.findByIdAndUpdate(
                { _id: req.body.blogId },
                {
                    $push: { likes: req.body.userId },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ blog: likeBlog })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã có lỗi xảy ra khi thích bài viết này',
            })
        }
    },
    // unlike blog
    unlikeBlog: async (req, res) => {
        try {
            // check blog exits
            const blog = await Blog.findById({ _id: req.body.blogId })
            if (!blog) {
                return res.status(404).json({ message: 'Không tìm thấy bài viết này' })
            }

            // pull user id from likes
            const unlikeBlog = await Blog.findByIdAndUpdate(
                { _id: req.body.blogId },
                {
                    $pull: { likes: req.body.userId },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ blog: unlikeBlog })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã xảy ra lỗi khi không thich bài viết này',
            })
        }
    },
    // save blog
    savedBlog: async (req, res) => {
        try {
            // check user exits?
            const user = await User.findById({ _id: req.body.userId })
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng này' })
            }

            // check blog exits?
            const blog = await Blog.findById({ _id: req.body.blogId })
            if (!blog) {
                return res.status(404).json({ message: 'Không tìm thấy bài viết này' })
            }

            // update savedBlog on user
            const savedBlog = await User.findByIdAndUpdate(
                { _id: req.body.userId },
                {
                    $push: { savedBlog: req.body.blogId },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ user: savedBlog })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Lưu bài viết thất bại' })
        }
    },
    // unsaved blog
    unsavedBlog: async (req, res) => {
        try {
            // check user exits?
            const user = await User.findById({ _id: req.body.userId })
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng này' })
            }

            // check blog exits?
            const blog = await Blog.findById({ _id: req.body.blogId })
            if (!blog) {
                return res.status(404).json({ message: 'Không tìm thấy bài viết này' })
            }

            // update save blog on user
            const unsavedBlog = await User.findByIdAndUpdate(
                { _id: req.body.userId },
                {
                    $pull: { savedBlog: req.body.blogId },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ blog: unsavedBlog })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Hủy lưu bài viết thất bại' })
        }
    },
    // get all save blog
    getAllSavedBlog: async (req, res) => {
        const { limit } = pagination(req.query)

        try {
            // check user exits?
            const user = await User.findById({ _id: req.query.id })
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng này' })
            }

            // get save blog by user
            const features = new ApiFeatures(
                Blog.find({ _id: { $in: user.savedBlog } }, { content: 0 })
                    .populate({
                        path: 'user',
                    })
                    .populate('category'),
                req.query
            )
                .pagination()
                .sort()
                .search()
                .filter()

            const blogList = await Promise.allSettled([
                features.query,
                Blog.countDocuments(features.queryString),
            ])

            let totalCount = 0
            const data = blogList[0].status === 'fulfilled' ? blogList[0].value : []
            if (req.query.search) {
                const count = await Blog.aggregate([
                    {
                        $match: {
                            _id: { $in: user.savedBlog },
                            title: req.query.search,
                        },
                    },
                    {
                        $sort: { createdAt: -1 },
                    },
                    {
                        $count: 'count',
                    },
                    {
                        $project: {
                            count: 1,
                        },
                    },
                ])

                totalCount = Math.ceil(count[0]?.count / limit) || 0
            } else {
                totalCount = blogList[1].status === 'fulfilled' ? blogList[1].value : 0
            }

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã xảy ra lỗi khi lấy tất cả bài viết đã lưu',
            })
        }
    },
}

module.exports = BlogController
