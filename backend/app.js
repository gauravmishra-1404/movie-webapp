const express = require("express")
const app = express()
const dotenv = require("dotenv")
var cors = require('cors')
dotenv.config()
const userRouter = require("./routes/userRoute")
const movieRouter = require("./routes/movieRoute")
const theatreRouter = require("./routes/theatreRoutes")
const showsRouter = require("./routes/showRoutes")
const bookingRouter = require("./routes/bookingRoute")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")


// Homeworks
// Implement the Delete modal for both movies and Theatres
// While populating owners on theatres, we only want to get the name field, not others

// Add in middleware to handle request body as JSON
app.use(express.json())
app.use(cors())
app.use(helmet())


// Rate limiter middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in ms
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});


app.use("/api/", apiLimiter)


// Registering my root level routes
app.use("/api/user", userRouter)
app.use("/api/movies", movieRouter)
app.use("/api/theatres", theatreRouter)
app.use("/api/shows", showsRouter)
app.use("/api/bookings", bookingRouter)


const { connectDB } = require("./config/db")
connectDB()

app.listen(process.env.PORT, () => {
    console.log("Backend application has started!")
})