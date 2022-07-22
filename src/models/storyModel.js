const mongoose = require('mongoose')

const story = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        avatarCover: {
            type: String,
            required: true,
        },
        dateOfBirth: {
            type: Date,
            default: Date.now(),
        },
        domicile: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        occupation: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        nationality: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
            minLength: 100,
            trim: true,
            lowercase: true,
        },
        content: {
            type: String,
            required: true,
            minLength: 500,
        },
        urlSocial: [
            {
                type: String,
                trim: true,
                default: 'https://www.instagram.com/truong_01h/',
            },
        ],
    },
    {
        timestamps: true,
    }
)

story.index({ fullname: 'text' })

const Story = mongoose.model('Story', story)
Story.createIndexes({ fullname: 'text' })

module.exports = Story
