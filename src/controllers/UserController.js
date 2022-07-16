const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const { hashPassword } = require('../utils/hashPassword')
const pagination = require('../utils/pagination')

const UserController = {
    // add user
    addUser: async (req, res) => {
        try {
            const hasUser = await User.findOne({ email: req.body.email })
            if (hasUser) {
                return res.status(400).json({ message: 'This user already exits' })
            }

            const password = await hashPassword(req.body.password)

            const user = new User({
                ...req.body,
                password,
            })

            await user.save()

            res.status(200).json({ user, message: 'Add user successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Add user failed' })
        }
    },
    // get all user
    getAllUser: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const users = await User.aggregate([
                {
                    $facet: {
                        data: [
                            { $limit: limit },
                            { $skip: skip },
                            { $sort: { createdAt: -1 } },
                            { $project: { rf_token: 0 } },
                            {
                                $lookup: {
                                    from: 'blogs',
                                    localField: 'savedBlog',
                                    foreignField: '_id',
                                    pipeline: [{ $project: { content: 0 } }],
                                    as: 'savedBlog',
                                },
                            },
                        ],
                        count: [
                            {
                                $count: 'count',
                            },
                        ],
                    },
                },
                {
                    $project: {
                        data: 1,
                        count: {
                            $arrayElemAt: ['$count.count', 0],
                        },
                    },
                },
            ])

            const data = users[0].data
            const totalCount = Math.ceil(users[0].count / limit) || 0

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get all user failed' })
        }
    },
    // get by id
    getByIdUser: async (req, res) => {
        try {
            const user = await User.findById({ _id: req.params.id })
            if (!user) {
                return res.status(404).json({ message: 'Not found this user' })
            }

            res.status(200).json({ user })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get by id user failed' })
        }
    },
    // search user
    searchUser: async (req, res) => {
        const { limit, skip } = pagination(req.query)
        try {
            const data = await User.aggregate([
                {
                    $match: {
                        $text: {
                            $search: req.query.name,
                        },
                    },
                },
                { $limit: limit },
                { $skip: skip },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        rf_token: 0,
                    },
                },
            ])

            const count = await User.aggregate([
                {
                    $match: {
                        $text: {
                            $search: req.query.name,
                        },
                    },
                },
                { $count: 'count' },
                {
                    $project: {
                        count: 1,
                    },
                },
            ])

            const totalCount = Math.ceil(count[0]?.['count'] / limit) || 0

            // console.log(data, totalCount)
            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Not found name user' })
        }
    },
    // update user
    updateUser: async (req, res) => {
        try {
            const user = await User.findById({ _id: req.params.id })
            if (!user) {
                return res.status(404).json({ message: 'Not found this user' })
            }

            const password = req.body.password
                ? await hashPassword(req.body.password)
                : user.password

            await User.findByIdAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        ...req.body,
                        password,
                    },
                },
                { new: true }
            )

            res.status(200).json({ message: 'Update user successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Update user failed' })
        }
    },
    // delete user
    deleteUser: async (req, res) => {
        try {
            const user = await User.findById({ _id: req.params.id })

            if (!user) {
                return res.status(404).json({ message: 'Not found this user' })
            }

            // delete user
            await User.findByIdAndDelete({ _id: req.params.id })

            // delete blog by userId
            await Blog.deleteMany({ _id: req.params.id })

            res.status(200).json({ message: 'Delete user successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Delete user failed' })
        }
    },
}

module.exports = UserController
