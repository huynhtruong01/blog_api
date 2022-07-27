const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Role = require('../models/roleModel')
const User = require('../models/userModel')
const pagination = require('../utils/pagination')

const RoleController = {
    // add role
    addRole: async (req, res) => {
        try {
            const role = new Role({
                ...req.body,
            })

            await role.save()

            res.status(200).json({ role, message: 'Add role name successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Add role name failed' })
        }
    },
    // get all role
    getAllRole: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const roleList = await Role.aggregate([
                {
                    $facet: {
                        data: [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'userList',
                                    foreignField: '_id',
                                    as: 'userList',
                                },
                            },
                            {
                                $sort: { createdAt: -1 },
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
                                $count: 'count',
                            },
                        ],
                    },
                },
                { $unwind: '$count' },
            ])

            console.log(roleList)

            const data = roleList[0]?.data
            const totalCount = Math.ceil(roleList[0]?.count?.count / limit) || 0

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get all role failed' })
        }
    },
    // get by id role
    getByIdRole: async (req, res) => {
        try {
            const role = await Role.findById({ _id: req.params.id })
            if (!role) {
                return res.status(404).json({ message: 'Not found this role' })
            }

            res.status(200).json({ data: role })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get by id role failed' })
        }
    },
    // update role
    updateRole: async (req, res) => {
        try {
            const role = await Role.findById({ _id: req.params.id })
            if (!role) {
                return res.status(404).json({ message: 'Not found this role' })
            }

            const data = await Role.findByIdAndUpdate(
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

            res.status(200).json({ role: data, message: 'Update role name successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Update role name failed' })
        }
    },
    // delete role
    deleteRole: async (req, res) => {
        try {
            const role = await Role.findById({ _id: req.params.id })
            if (!role) {
                return res.status(404).json({ message: 'Not found this role' })
            }

            const userList = await User.find({ role: req.params.id })
            if (userList.length > 0) {
                return res.status(400).json({
                    message: "Can't delete this role. You must delete all user has this role",
                })
            }

            await Role.findByIdAndDelete({ _id: req.params.id })

            res.status(200).json({ message: 'Delete this role successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Delete role failed' })
        }
    },
    // search role
    searchRole: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const data = await Role.aggregate([
                {
                    $match: {
                        $text: {
                            $search: req.query.name,
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ])

            const count = await Story.aggregate([
                {
                    $match: {
                        $text: {
                            $search: req.query.name,
                        },
                    },
                },
                { $count: 'count' },
            ])

            const totalCount = Math.ceil(count[0]?.['count'] / limit) || 0

            // console.log(data.length, count)
            // console.log(data, totalCount)

            res.status(200).json({ data, totalCount })
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ error: error.message, message: 'Search name role failed' })
        }
    },
}

module.exports = RoleController
