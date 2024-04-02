// Import dependencies
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"

// Import local modules
import allRoutes from "./routes/index.js"
import logger from "./helpers/logger.js"

// Import Environment Variables
import { ENV_VAR } from "./helpers/env.js"

// Create a new Express app instance
const app = express()

// Configure the app to use JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Enable CORS for allowed origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // Check if the origin is allowed
      if (ENV_VAR.ALLOWED_ORIGINS.indexOf(origin) === -1) {
        // If the origin is not allowed, set the Access-Control-Allow-Origin header to null
        return callback(null, false)
      }
      // If the origin is allowed, set the Access-Control-Allow-Origin header to the origin and continue with the request
      return callback(null, true)
    },
    credentials: true // Set to allow credentials in the request
  })
)

// Set the Base Url for the app
app.use(`/${ENV_VAR.BASE_URL}/v1`, allRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  // Check if the error is related to clearing the cookie
  // if (!err.skipCookieClearance) {
  if (err.clearCookies) {
    // res.clearCookie("jwt", getCookieOptions("logout"))
    console.log("getCookieOptions");
  }
  logger.error(err.message, err?.meta)
  // Set Status code based error type
  res.status(400).json({ success: false, error: err.message })

  // Pass the error to the next error handling middleware
  // next(err);
})

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Connecting to the MongoDB Database and then Starting server
if (!ENV_VAR.UNIT_TEST) {
  mongoose
    .connect(ENV_VAR.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log("Connected to database")
      app.listen(ENV_VAR.PORT, () => {
        console.log(`Server started and listening on port ${ENV_VAR.PORT}`)
      })
    })
    .catch((err) => console.error("Error connecting to MongoDB", err))
}

export default app
