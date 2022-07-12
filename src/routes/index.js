const express = require('express')
const router = express.Router()
const routerStories = require('./stories')
const routerAuth = require('./auth')

const routes = [router.use('/stories', routerStories), router.use('/auth', routerAuth)]

module.exports = routes
