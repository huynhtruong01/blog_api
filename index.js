const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectData = require('./src/config/database')
const routes = require('./src/routes')

// middleware
dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('common'))
app.use(cors())
app.use(cookieParser())

// connect db
connectData()

// routes
app.use('/api', routes)

const port = process.env.PORT || 5500
app.listen(port, () => console.log(`Server is running ${port}`))
