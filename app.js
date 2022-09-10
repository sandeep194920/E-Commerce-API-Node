const express = require('express')
const app = express()

// rest of the packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectDB = require('./db/connect')
require('dotenv').config()
require('express-async-errors') // for avoiding writing try-catch in controllers
const notFoundMW = require('./middleware/not-found')
const errorHandlerMW = require('./middleware/error-handler')
const authRouter = require('./routes/authRoute')
const userRouter = require('./routes/userRoute')
const productRouter = require('./routes/productRoute')
const reviewRouter = require('./routes/reviewRoute')
const orderRouter = require('./routes/orderRoute')
const fileUpload = require('express-fileupload')

// Security packages
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const expressMongoSanitize = require('express-mongo-sanitize')

//// Middlewares and Routes

// for rate limiter if it's behind the proxy then we need to set that as well
app.set('turst proxy', 1)
app.use(
  rateLimiter({
    windowsMs: 15 * 60 * 1000,
    max: 60,
  })
)
app.use(helmet())
app.use(xss())
app.use(cors())
app.use(expressMongoSanitize())

app.use(morgan('tiny'))
app.use(express.json()) // used to get req.body data for post reqs
app.use(cookieParser(process.env.JWT_SECRET)) // used to parse the cookies sent from the client(front-end) or postman

// enable public folder to be publicly available
app.use(express.static('./public'))
app.use(fileUpload())
// Routes

// Basic Route
app.get('/', (req, res) => {
  console.log(req.signedCookies) // this is avaiable because of cookie-parser package
  res.send('E-Commerce API Home page')
})

// auth router
app.use('/api/v1/auth', authRouter)

// user router
app.use('/api/v1/users', userRouter)

// product router
app.use('/api/v1/products', productRouter)

// review router
app.use('/api/v1/reviews', reviewRouter)

// order router
app.use('/api/v1/orders', orderRouter)

app.use(notFoundMW)
app.use(errorHandlerMW)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    // connect to db
    await connectDB(process.env.MONGO_URL)
    app.listen(port)
    console.log('Server is listening on port', port)
  } catch (err) {
    console.log(err)
  }
}

start()
