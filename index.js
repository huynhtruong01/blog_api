const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectData = require('./src/config/database')
const routes = require('./src/routes')

// middleware
dotenv.config().parsed

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('common'))
app.use(cors())
app.use(cookieParser())

// connect db
connectData()

// routes
app.use('/api', routes)
app.get('/', async (req, res) => {
    res.json({
        message: 'Welcome to Athetics Huynh Blog',
        'stories-api': 'https://athetics-blog-app.herokuapp.com/api/stories',
        'blogs-api': 'https://athetics-blog-app.herokuapp.com/api/blogs',
    })
})

const port = process.env.PORT || 5500
app.listen(port, () => console.log(`Server is running port ${port}`))
