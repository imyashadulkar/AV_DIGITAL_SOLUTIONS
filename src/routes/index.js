// Import dependencies
import express from "express";

// Import local modules
import { CONST_STRINGS, BASE_ROUTES } from "../helpers/constants.js";
import adminRoutes from "./admin.js";
import authRoutes from "./auth.js";
import appRoutes from "./excel.js";
import moduleRoutes from "./module.js";
import chatRoutes from "./chat.js";

const router = express.Router();

/**
 * @swagger
 * /webhook:
 *   get:
 *     summary: Verify the webhook
 *     description: Verify the webhook with Facebook.
 *     tags:
 *       - Webhook Verification
 *     parameters:
 *       - name: hub.mode
 *         in: query
 *         required: true
 *         description: "Should be 'subscribe'"
 *         schema:
 *           type: string
 *       - name: hub.verify_token
 *         in: query
 *         required: true
 *         description: "The token you set in your Facebook app"
 *         schema:
 *           type: string
 *       - name: hub.challenge
 *         in: query
 *         required: true
 *         description: "The challenge string sent by Facebook"
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Webhook verified successfully"
 *       '403':
 *         description: "Verification failed"
 */
router.get(BASE_ROUTES.WEBHOOK_ROUTE, async (req, res) => {
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  console.log("====================================");
  console.log("challenge:", challenge);
  console.log("verifyToken:", verifyToken);
  console.log("====================================");

  // Check if the verify token matches
  if (
    verifyToken === process.env.FACEBOOK_VERIFY_TOKEN ||
    verifyToken === "meatyhamhock"
  ) {
    console.log("Webhook verified successfully.");
    return res.status(200).send(challenge); // Send the challenge back as plain text
  } else {
    console.error("Verification failed.");
    return res.status(403).send("Verification failed");
  }
});

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Handle incoming lead data
 *     description: Receive lead data from Facebook.
 *     tags:
 *       - Lead Data
 *     responses:
 *       '200':
 *         description: "Event received successfully"
 *       '404':
 *         description: "Not Found"
 */
router.post(BASE_ROUTES.WEBHOOK_ROUTE, async (req, res) => {
  console.log("Received lead data:", req.body);

  // Check if the request contains leadgen data
  if (req.body.object === "page") {
    req.body.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        if (change.field === "leadgen") {
          const leadData = change.value;
          // Process the lead data (e.g., save to your database)
          console.log("New lead received:", leadData);
          // Here you can implement your logic to save the lead data
        }
      });
    });
    return res.status(200).send("EVENT_RECEIVED");
  } else {
    return res.status(404).send("Not Found");
  }
});

// Mount the routes at respective BASE paths
router.use(BASE_ROUTES.ADMIN_ROUTES, adminRoutes);
router.use(BASE_ROUTES.AUTH_ROUTES, authRoutes);
router.use(BASE_ROUTES.APP_APIS, appRoutes);
router.use(BASE_ROUTES.MODULE_ROUTES, moduleRoutes);
router.use(BASE_ROUTES.CHAT_ROUTES, chatRoutes);

export default router;
