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
 * /ping:
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
// Ping route to check the server status
router.get(BASE_ROUTES.PING_ROUTE, async (req, res) => {
  console.log("not getting anything");
  res.status(200).json({
    success: true,
    message: CONST_STRINGS.SERVER_RUNNING_MESSAGE,
  });
});

// Mount the routes at respective BASE paths
router.use(BASE_ROUTES.ADMIN_ROUTES, adminRoutes);
router.use(BASE_ROUTES.AUTH_ROUTES, authRoutes);
router.use(BASE_ROUTES.APP_APIS, appRoutes);
router.use(BASE_ROUTES.MODULE_ROUTES, moduleRoutes);
router.use(BASE_ROUTES.CHAT_ROUTES, chatRoutes);

export default router;
