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
 *     summary: Ping the server to check the status
 *     description: Ping the server to check if it is running.
 *     tags:
 *       - Server Status
 *     responses:
 *       200:
 *         description: Ping the server to check if it is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request is success.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message indicating the server status.
 *                   example: "Server is running. Code deployed on 01-June-2024."
 */

router.get(BASE_ROUTES.WEBHOOK_ROUTE, async (req, res) => {
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"]; // This token should match the one you set in your Facebook app
  console.log("====================================");
  console.log("challenge", challenge, verifyToken);
  console.log("====================================");

  if (verifyToken === process.env.FACEBOOK_VERIFY_TOKEN || "meatyhamhock") {
    console.log("Webhook verified successfully.");
    return res.status(200).json({ challenge });
  } else {
    console.error("Verification failed.");
    return res.status(403).send("Verification failed");
  }
});

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: get the server to check the status
 *     description: Ping the server to check if it is running.
 *     tags:
 *       - get fb data Status
 *     responses:
 *       200:
 *         description: Ping the server to check if it is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request is success.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message indicating the server status.
 *                   example: "Server is running. Code deployed on 01-June-2024."
 */

// This route handles incoming lead data from Facebook
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
