import express from "express";

import {
  changeEmailWithCode,
  changePassword,
  changePasswordWithCode,
  deleteUserAndData,
  getChangeEmailCode,
  getForgotPasswordCode,
  getRegisterCode,
  getTermsAndConditions,
  getUserData,
  loginWithEmailPassword,
  logoutUser,
  registerWithCode,
  resendRegisterCode,
  updateUserStatusWithKey,
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

router.post(
  AUTH_ROUTES.GET_CHANGE_EMAIL_CODE,
  verifyToken,
  getChangeEmailCode,
  successResponse
);

router.post(
  AUTH_ROUTES.CHANGE_EMAIL_WITH_CODE,
  verifyToken,
  changeEmailWithCode,
  successResponse
);

router.delete(
  AUTH_ROUTES.DELETE_USER_AND_DATA,
  deleteUserAndData,
  successResponse
);

router.get(AUTH_ROUTES.GET_USER_DATA, getUserData, successResponse);

router.get(
  AUTH_ROUTES.GET_TERMS_AND_CONDITIONS,
  getTermsAndConditions,
  successResponse
);

router.post(
  AUTH_ROUTES.UPDATE_USER_STATUS_WITH_KEY,
  updateUserStatusWithKey,
  successResponse
);

export default router;
