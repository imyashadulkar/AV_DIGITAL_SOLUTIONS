// Import dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "../src/helpers/utils/webSocket.js";
import { swaggerDocs } from "./helpers/utils/swagger.js";
// Import local modules
import allRoutes from "./routes/index.js";
import logger from "./helpers/logger.js";
import { startLeadScheduler } from "./middleware/lead_scheduler.js";

// Import Environment Variables
import { ENV_VAR } from "./helpers/env.js";
const { BASE_URL, VERSION, PORT } = ENV_VAR;

// Create a new Express app instance
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Configure the app to use JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  }),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Enable CORS for allowed origins
// Ensure ALLOWED_ORIGINS is an array
//
//
console.log(process.env.ALLOWED_ORIGINS);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",");
console.log(ALLOWED_ORIGINS);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests for non-prod environments)
      if (!origin) {
        if (process.env.ENV === "PROD") {
          return callback(new Error("Not authorized by CORS"), false);
        } else {
          return callback(null, true);
        }
      }
      console.log(origin, ALLOWED_ORIGINS.includes(origin));
      // Check if the origin is in the allowed list
      if (!ALLOWED_ORIGINS.includes(origin)) {
        return callback(new Error("Not allowed by CORS"), false);
      }

      // If the origin is allowed, continue with the request
      return callback(null, true);
    },
    credentials: true, // Allow credentials in requests
  }),
);
// Set the Base Url for the app
app.use(`/${ENV_VAR.BASE_URL}/v1`, allRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.clearCookies) {
    console.log("getCookieOptions");
  }
  logger.error(err.message, err?.meta);
  // Set Status code based error type
  res.status(400).json({ success: false, error: err.message });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Connecting to the MongoDB Database and then Starting server
if (!ENV_VAR.UNIT_TEST) {
  let serverUrl = "";
  if (ENV_VAR.ENV === "local") {
    serverUrl = `http://localhost:${ENV_VAR.PORT}`;
  } else {
    serverUrl = `https://av-digital-solutions-1.onrender.com`;
  }

  mongoose
    .connect(ENV_VAR.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to database");
      app.listen(ENV_VAR.PORT, () => {
        console.log(`Server started, API docs at ${serverUrl}/api-docs`);
      });
    })
    .catch((err) => console.error("Error connecting to MongoDB", err));
}

setupWebSocket(wss);
startLeadScheduler();

export default app;
