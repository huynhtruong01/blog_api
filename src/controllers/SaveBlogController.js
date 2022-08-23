const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const ApiFeatures = require('../utils/apiFeatures')
const pagination = require('../utils/pagination')

const SaveBlogController = {
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

module.exports = SaveBlogController
