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

            res.status(200).json({ user, message: 'Create user successfully' })
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
                            {
                                $lookup: {
                                    from: 'roles',
                                    localField: 'role',
                                    foreignField: '_id',
                                    pipeline: [{ $project: { userList: 0 } }],
                                    as: 'role',
                                },
                            },
                            {
                                $unwind: '$role',
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
                .select('-password')
                .populate('role')
            if (!user) {
                return res.status(404).json({ message: 'Not found this user' })
            }

            res.status(200).json({ data: user })
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
                    $lookup: {
                        from: 'roles',
                        localField: 'role',
                        foreignField: '_id',
                        pipeline: [{ $project: { userList: 0 } }],
                        as: 'role',
                    },
                },
                {
                    $unwind: '$role',
                },
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
            await Blog.deleteMany({ user: req.params.id })

            // find all user following by this user and delete this user
            const userList = await User.find()
            const newUserFollowingList = userList
                .filter((x) => {
                    for (const follow of x.following) {
                        if (follow == req.params.id) return true
                    }

                    return false
                })
                .map((x) => x._id)
            if (newUserFollowingList.length > 0) {
                await User.updateMany(
                    { _id: { $in: newUserFollowingList } },
                    {
                        $pull: {
                            following: req.params.id,
                        },
                    },
                    {
                        new: true,
                    }
                )
            }

            // find all user followers by this user and delete this user
            const newUserFollowerList = userList
                .filter((x) => {
                    for (const follow of x.followers) {
                        if (follow == req.params.id) return true
                    }

                    return false
                })
                .map((x) => x._id)
            if (newUserFollowerList.length > 0) {
                await User.updateMany(
                    { _id: { $in: newUserFollowerList } },
                    {
                        $pull: {
                            followers: req.params.id,
                        },
                    },
                    {
                        new: true,
                    }
                )
            }

            res.status(200).json({ message: 'Delete user successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Delete user failed' })
        }
    },
    // follow
    followUser: async (req, res) => {
        try {
            // check user self
            const selfUser = await User.findById({ _id: req.body.id })
            if (!selfUser) {
                return res.status(404).json({
                    message: 'Không tìm thấy tài khoản của bạn để theo dõi người dùng này',
                })
            }

            // check other user
            const otherUser = await User.findById({ _id: req.body.userId })
            if (!otherUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng này' })
            }

            // push to following other user
            await User.findByIdAndUpdate(
                { _id: req.body.id },
                {
                    $push: {
                        following: req.body.userId,
                    },
                },
                {
                    new: true,
                }
            )

            // other user push userId to followers
            await User.findByIdAndUpdate(
                { _id: req.body.userId },
                {
                    $push: {
                        followers: req.body.id,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Đã theo dõi' })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã xảy ra lỗi khi theo dõi người dùng khác',
            })
        }
    },
    // unfollow
    unfollowUser: async (req, res) => {
        try {
            // check user self
            const selfUser = await User.findById({ _id: req.body.id })
            if (!selfUser) {
                return res.status(404).json({
                    message: 'Không tìm thấy tài khoản của bạn để theo dõi người dùng này',
                })
            }

            // check other user
            const otherUser = await User.findById({ _id: req.body.userId })
            if (!otherUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng này' })
            }

            // pull to following other user
            await User.findByIdAndUpdate(
                { _id: req.body.id },
                {
                    $pull: {
                        following: req.body.userId,
                    },
                },
                {
                    new: true,
                }
            )

            // other user pull userId to followers
            await User.findByIdAndUpdate(
                { _id: req.body.userId },
                {
                    $pull: {
                        followers: req.body.id,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Đã hủy theo dõi' })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã xảy ra lỗi khi hủy theo dõi người dùng này',
            })
        }
    },
    // get all follower
    getAllFollower: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const user = await User.findById({ _id: req.params.id })
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy tài khoản của bạn' })
            }

            const followerList = await User.aggregate([
                {
                    $facet: {
                        data: [
                            {
                                $match: {
                                    _id: user._id,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'followers',
                                    foreignField: '_id',
                                    pipeline: [
                                        {
                                            $project: {
                                                password: 0,
                                                email: 0,
                                            },
                                        },
                                    ],
                                    as: 'followers',
                                },
                            },
                            {
                                $unwind: '$followers',
                            },
                            {
                                $project: {
                                    _id: '$followers._id',
                                    fullname: '$followers.fullname',
                                    username: '$followers.username',
                                    detail: '$followers.detail',
                                    website: '$followers.website',
                                    avatar: '$followers.avatar',
                                },
                            },

                            {
                                $limit: limit,
                            },
                            {
                                $skip: skip,
                            },
                        ],
                        count: [
                            {
                                $match: {
                                    _id: user._id,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'followers',
                                    foreignField: '_id',
                                    pipeline: [
                                        {
                                            $project: {
                                                password: 0,
                                                email: 0,
                                            },
                                        },
                                    ],
                                    as: 'followers',
                                },
                            },
                            {
                                $unwind: '$followers',
                            },
                            {
                                $project: {
                                    _id: '$followers._id',
                                    fullname: '$followers.fullname',
                                    username: '$followers.username',
                                    detail: '$followers.detail',
                                    website: '$followers.website',
                                    avatar: '$followers.avatar',
                                },
                            },
                            {
                                $count: 'count',
                            },
                        ],
                    },
                },
                {
                    $unwind: '$count',
                },
            ])

            let data = []
            let totalCount = 0
            // search
            if (req.query.name) {
                data = followerList[0]?.data.filter((x) => x.username.includes(req.query.name))
                totalCount = Math.ceil(data.length / limit) || 0
            } else {
                data = followerList[0]?.data
                totalCount = Math.ceil(followerList[0]?.count.count / limit) || 0
            }

            res.json({ data, totalCount })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã xảy ra lỗi khi lấy tất cả người dùng theo dõi',
            })
        }
    },
    // get all following
    getAllFollowing: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const user = await User.findById({ _id: req.params.id })
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy tài khoản của bạn' })
            }

            const followingList = await User.aggregate([
                {
                    $facet: {
                        data: [
                            {
                                $match: {
                                    _id: user._id,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'following',
                                    foreignField: '_id',
                                    pipeline: [
                                        {
                                            $project: {
                                                password: 0,
                                                email: 0,
                                            },
                                        },
                                    ],
                                    as: 'following',
                                },
                            },
                            {
                                $unwind: '$following',
                            },
                            {
                                $project: {
                                    _id: '$following._id',
                                    fullname: '$following.fullname',
                                    username: '$following.username',
                                    detail: '$following.detail',
                                    website: '$following.website',
                                    avatar: '$following.avatar',
                                },
                            },

                            {
                                $limit: limit,
                            },
                            {
                                $skip: skip,
                            },
                        ],
                        count: [
                            {
                                $match: {
                                    _id: user._id,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'following',
                                    foreignField: '_id',
                                    pipeline: [
                                        {
                                            $project: {
                                                password: 0,
                                                email: 0,
                                            },
                                        },
                                    ],
                                    as: 'following',
                                },
                            },
                            {
                                $unwind: '$following',
                            },
                            {
                                $project: {
                                    _id: '$following._id',
                                    fullname: '$following.fullname',
                                    username: '$following.username',
                                    detail: '$following.detail',
                                    website: '$following.website',
                                    avatar: '$following.avatar',
                                },
                            },
                            {
                                $count: 'count',
                            },
                        ],
                    },
                },
                {
                    $unwind: '$count',
                },
            ])

            let data = []
            let totalCount = 0
            // search
            if (req.query.name) {
                data = followingList[0]?.data.filter((x) => x.username.includes(req.query.name))
                totalCount = Math.ceil(data.length / limit) || 0
            } else {
                data = followingList[0]?.data
                totalCount = Math.ceil(followingList[0]?.count.count / limit) || 0
            }

            res.json({ data, totalCount })
        } catch (error) {
            res.status(500).json({
                error: error.message,
                message: 'Đã xảy ra lỗi khi lấy tất cả người dùng theo dõi',
            })
        }
    },
    // add website url
    addWebsiteUrl: async (req, res) => {
        try {
            const user = await User.findById({ _id: req.params })

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy tài khoản của bạn' })
            }

            await User.findByIdAndUpdate(
                { _id: req.params },
                {
                    $push: {
                        websiteUrl: req.body.websiteUrl,
                    },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Add website url successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, error: 'Add website url failed' })
        }
    },
}

module.exports = UserController
