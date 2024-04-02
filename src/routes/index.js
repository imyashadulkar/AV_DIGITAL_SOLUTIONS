// Import dependencies
import express from "express"

// Import local modules
import { CONST_STRINGS, BASE_ROUTES } from "../helpers/constants.js"
import adminRoutes from "./admin.js"
import moduleRoutes from "./module.js"

const router = express.Router()

// Ping route to check the server status
router.get(BASE_ROUTES.PING_ROUTE, async (req, res) => {
  console.log("not getting anything");
  res.status(200).json({
    success: true,
    message: CONST_STRINGS.SERVER_RUNNING_MESSAGE
  })
})

// Mount the routes at respective BASE paths
router.use(BASE_ROUTES.ADMIN_ROUTES, adminRoutes)
router.use(BASE_ROUTES.MODULE_ROUTES, moduleRoutes)

export default router
