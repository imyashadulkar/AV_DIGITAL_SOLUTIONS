import express from "express";

import {
  changePassword,
  changePasswordWithCode,
  changeSubUserPassword,
  createSubUser,
  deleteUser,
  getForgotPasswordCode,
  getRegisterCode,
  getSubUser,
  loginWithEmailPassword,
  logoutUser,
  registerWithCode,
  resendRegisterCode,
  subUserLoginWithEmailPassword,
  updateUser,
  validateTokenResponse
} from "../controllers/auth.js";
import { AUTH_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

const router = express.Router();

// Unprotected Routes
router.get(AUTH_ROUTES.VERIFY_TOKEN, validateTokenResponse, successResponse);
router.post(AUTH_ROUTES.GET_REGISTER_CODE, getRegisterCode, successResponse);
router.post(
  AUTH_ROUTES.RESEND_REGISTER_CODE,
  resendRegisterCode,
  successResponse
);
router.post(AUTH_ROUTES.REGISTER_WITH_CODE, registerWithCode, successResponse);

/**
 * @swagger
 * /auth/login-with-email-password:
 *   post:
 *     summary: Login with email and password
 *     description: Authenticate user using email and password, and generate a JWT token for authorization.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "60a1b54b5b3e5d0015d1490e"
 *                       description: The ID of the logged-in user.
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                       description: The email address of the logged-in user.
 *                     role:
 *                       type: string
 *                       example: "user"
 *                       description: The role of the logged-in user.
 *                     isAuthUser:
 *                       type: boolean
 *                       example: true
 *                       description: Indicates if the user is authenticated.
 *       400:
 *         description: Invalid credentials or missing required inputs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials. Please check your email and password."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */

router.post(
  AUTH_ROUTES.LOGIN_WITH_EMAIL_PASSWORD,
  loginWithEmailPassword,
  successResponse
);
router.post(
  AUTH_ROUTES.GET_FORGOT_PASSWORD_CODE,
  getForgotPasswordCode,
  successResponse
);
router.post(
  AUTH_ROUTES.CHANGE_PASSWORD_WITH_CODE,
  changePasswordWithCode,
  successResponse
);

router.post(AUTH_ROUTES.LOGOUT_USER, logoutUser, successResponse);

// Protected Routes
router.post(
  AUTH_ROUTES.CHANGE_PASSWORD,
  verifyToken,
  changePassword,
  successResponse
);
router.put(
  AUTH_ROUTES.UPDATE_USER,
  verifyToken,
  updateUser,
  successResponse
);
router.delete(
  AUTH_ROUTES.DELETE_USER,
  verifyToken,
  deleteUser,
  successResponse
);

router.post(
  AUTH_ROUTES.AUTH_SUB_USER_GENERATION,
  verifyToken,
  createSubUser,
  successResponse
);
router.get(
  AUTH_ROUTES.GET_SUB_USER,
  verifyToken,
  getSubUser,
  successResponse
);
router.post(
  AUTH_ROUTES.CHANGE_SUB_USER_PASSWORD,
  verifyToken,
  changeSubUserPassword,
  successResponse
);
router.post(
  AUTH_ROUTES.SUB_USER_LOGIN_WITH_EMAIL_PASSWORD,
  subUserLoginWithEmailPassword,
  successResponse
);

export default router;
