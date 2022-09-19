const express = require('express')
const router = express.Router()
const routerCommon = require('./common')
const routerStories = require('./stories')
const routerAuth = require('./auth')
const routerUsers = require('./users')
const routerCategories = require('./categories')
const routerBlogs = require('./blogs')
const routerRoles = require('./roles')
const routerSaveBlog = require('./saveBlog')
const routerComment = require('./comments')

const routes = [
    router.use('/common', routerCommon),
    router.use('/stories', routerStories),
    router.use('/auth', routerAuth),
    router.use('/users', routerUsers),
    router.use('/categories', routerCategories),
    router.use('/blogs', routerBlogs),
    router.use('/roles', routerRoles),
    router.use('/save-blog', routerSaveBlog),
    router.use('/comment', routerComment),
]

module.exports = routes
