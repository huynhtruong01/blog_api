const Blog = require('../models/blogModel')
const Category = require('../models/categoryModel')
const pagination = require('../utils/pagination')

const CategoryController = {
    // add category
    addCategory: async (req, res) => {
        try {
            console.log(req.body)
            const category = await Category.findOne({ name: req.body.name })
            if (category) {
                return res.status(400).json({ message: 'This category already exits' })
            }

            const newCategory = new Category({
                ...req.body,
            })

            await newCategory.save()

            res.status(200).json({ category: newCategory, message: 'Add category successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Add category failed' })
        }
    },
    // get all category
    getAllCategory: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const categories = await Category.aggregate([
                {
                    $facet: {
                        data: [
                            {
                                $sort: {
                                    createdAt: -1,
                                },
                            },
                            {
                                $limit: limit,
                            },
                            { $skip: skip },
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

            const data = categories[0]?.data
            const totalCount = Math.ceil(categories[0].count / limit) || 0

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get all category failed' })
        }
    },
    // get by id
    getByIdCategory: async (req, res) => {
        try {
            const category = await Category.findById({ _id: req.params.id })
            if (!category) {
                return res.status(404).json({ message: 'Not found this category' })
            }

            res.status(200).json({ data: category })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get by id category failed' })
        }
    },
    // update category
    updateCategory: async (req, res) => {
        try {
            const category = await Category.findById({ _id: req.params.id })
            if (!category) {
                return res.status(404).json({ message: 'Not found this category' })
            }

            await Category.findByIdAndUpdate(
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

            res.status(200).json({ message: 'Update category successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Update category failed' })
        }
    },
    // delete category
    deleteCategory: async (req, res) => {
        try {
            const blogList = await Blog.find({ category: req.params.id })
            if (blogList.length > 0) {
                return res.status(400).json({
                    message: "Can't delete this blog list. Please delete blog has this category",
                })
            }

            const category = await Category.findById({ _id: req.params.id })
            if (!category) {
                return res.status(404).json({ message: 'Not found this category' })
            }

            await Category.findByIdAndDelete({ _id: req.params.id })

            res.status(200).json({ message: 'Delete category successfully' })
        } catch (error) {
            res.status(500).json()
        }
    },
    searchCategory: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const data = await Category.aggregate([
                {
                    $match: {
                        $text: {
                            $search: req.query.name,
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                { $limit: limit },
                { $skip: skip },
            ])

            const count = await Category.aggregate([
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

            const totalCount = count?.[0]?.count || 0

            res.status(200).json({ data, totalCount })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Not found this category' })
        }
    },
}

module.exports = CategoryController
