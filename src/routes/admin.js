// Import necessary modules
import express from "express";

import {
  adminLoginWithCode,
  getAdminLoginCode,
  getAllUsers,
  getAllUsersLicenseData,
  getUserById,
  getUserLicenseDetailById,
  loginWithEmailPasswordAdmin,
  logoutAdmin,
  setLicenseDataById,
  updateUserStatus
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
router.post(
  ADMIN_ROUTES.SET_LICENSE_DATA_BY_ID,
  verifyToken,
  verifyAdmin,
  setLicenseDataById,
  successResponse
);
router.get(
  ADMIN_ROUTES.GET_ALL_USERS_LICENSE_DATA,
  verifyToken,
  verifyAdmin,
  getAllUsersLicenseData,
  successResponse
);
router.get(
  ADMIN_ROUTES.GET_USER_LICENSE_DATA_BY_ID,
  verifyToken,
  verifyAdmin,
  getUserLicenseDetailById,
  successResponse
);
router.post(
  ADMIN_ROUTES.UPDATE_USER_STATUS,
  verifyToken,
  verifyAdmin,
  updateUserStatus,
  successResponse
);
router.post(
  ADMIN_ROUTES.LOGOUT_ADMIN,
  verifyToken,
  verifyAdmin,
  logoutAdmin,
  successResponse
);

export default router;
