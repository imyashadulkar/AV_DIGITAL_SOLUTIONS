// Import dependencies
import winston, { createLogger } from "winston";
import winstonMongoDB from "winston-mongodb";

// Import Environment Variables
import { ENV_VAR } from "./env.js";

// Configure winston logger to log to MongoDB
const logger = createLogger({
  transports: [
    new winstonMongoDB.MongoDB({
      level: "info",
      db: ENV_VAR.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      collection: `${ENV_VAR.ENV}-application_logs`,
      format: winston.format.combine(
        // winston.format.timestamp(),
        // winston.format.json({ space: 2 }),
        winston.format.metadata() // Enable metadata handling
      )
    })
  ],
  defaultMeta: { env: ENV_VAR.ENV }
});

export default logger;
