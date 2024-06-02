// Import necessary modules
import express from "express";

import {
  adminLoginWithCode,
  getAdminLoginCode,
  getAllUsers,
  getUserById,
  loginWithEmailPasswordAdmin,

} from "../controllers/admincontroller.js";
import { ADMIN_ROUTES } from "../helpers/constants.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

// Create an instance of the router
const router = express.Router();

router.post(
  ADMIN_ROUTES.GET_ADMIN_LOGIN_CODE,
  getAdminLoginCode,
  successResponse
);

router.post(
  ADMIN_ROUTES.ADMIN_LOGIN_WITH_CODE,
  adminLoginWithCode,
  successResponse
);

router.post(
  ADMIN_ROUTES.LOGIN_WITH_EMAIL_PASSWORD_ADMIN,
  loginWithEmailPasswordAdmin,
  successResponse
);

router.get(
  ADMIN_ROUTES.GET_ALL_USERS,
  verifyToken,
  verifyAdmin,
  getAllUsers,
  successResponse
);
router.get(
  ADMIN_ROUTES.GET_USER_BY_ID,
  verifyToken,
  verifyAdmin,
  getUserById,
  successResponse
);

export default router;
