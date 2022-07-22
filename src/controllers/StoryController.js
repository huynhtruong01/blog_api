const Story = require('../models/storyModel')
const pagination = require('../utils/pagination')

const StoryController = {
    addStory: async (req, res) => {
        try {
            const newStory = new Story({ ...req.body })
            await newStory.save()

            res.status(200).json({ story: newStory, message: 'Add story successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Add story failed' })
        }
    },
    getAllStory: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        // console.log(req.query)

        try {
            const stories = await Story.aggregate([
                {
                    $facet: {
                        data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
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

            const data = stories[0].data
            const count = stories[0].count
            const totalCount = Math.ceil(count / limit) || 0

            res.status(200).json({ data, totalCount })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error.message, message: 'Get all story failed' })
        }
    },
    getByIdStory: async (req, res) => {
        try {
            const id = req.params.id

            const story = await Story.findById({ _id: id })
            if (!story) {
                return res.status(404).json({ message: 'Not found this story' })
            }

            res.status(200).json({ story, message: 'Get by id story successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Get by id story failed' })
        }
    },
    updateStory: async (req, res) => {
        try {
            const id = req.params.id

            const story = await Story.findById({ _id: id })
            if (!story) {
                return res.status(404).json({ message: 'Not found this story' })
            }

            const storyUpdated = await Story.findByIdAndUpdate(
                { _id: id },
                {
                    $set: { ...req.body },
                },
                {
                    new: true,
                }
            )

            res.status(200).json({ message: 'Update story successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Update story failed' })
        }
    },
    deleteStory: async (req, res) => {
        try {
            const id = req.params.id

            const story = await Story.findById({ _id: id })
            if (!story) {
                return res.status(404).json({ message: 'Not found this story' })
            }

            await Story.findByIdAndDelete({ _id: id })

            res.status(200).json({ message: 'Delete story successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message, message: 'Delete story failed' })
        }
    },
    searchStory: async (req, res) => {
        const { limit, skip } = pagination(req.query)

        try {
            const data = await Story.aggregate([
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

            console.log(data, totalCount)

            res.status(200).json({ data, totalCount })
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ error: error.message, message: 'Search name story failed' })
        }
    },
}

module.exports = StoryController
