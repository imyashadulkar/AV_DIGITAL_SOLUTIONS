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
  getSubUserById,
  getSubUserPermission,
  loginWithEmailPassword,
  logoutUser,
  registerWithCode,
  resendRegisterCode,
  subUserLoginWithEmailPassword,
  updateSubUserPermission,
  updateUser,
  validateTokenResponse,
} from "../controllers/Authentication/auth.js";
import { AUTH_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

const router = express.Router();

// Unprotected Routes

router.get(AUTH_ROUTES.VERIFY_TOKEN, validateTokenResponse, successResponse);

/**
 * @swagger
 * /auth/get-register-code:
 *   post:
 *     summary: Get Registration Code
 *     description: Generates a registration code and sends it to the user's email for verification.
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               userName:
 *                 type: string
 *                 example: john_doe
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               userRole:
 *                 type: string
 *                 example: "admin"
 *             required:
 *               - email
 *               - password
 *               - userName
 *               - phoneNumber
 *               - userRole
 *     responses:
 *       200:
 *         description: Registration code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *                       description: The ID of the user.
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     code:
 *                       type: string
 *                       example: "123456"
 *                       description: The registration code sent to the user.
 *                 responseMessage:
 *                   type: string
 *                   example: "Registration code sent successfully."
 *                   description: A message indicating the outcome of the operation.
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

router.post(AUTH_ROUTES.GET_REGISTER_CODE, getRegisterCode, successResponse);

/**
 * @swagger
 * /auth/resend-register-code:
 *   post:
 *     summary: Resend Registration Code
 *     description: Resends the registration code to the user's email for verification.
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
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Registration code resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *                       description: The ID of the user.
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     code:
 *                       type: string
 *                       example: "654321"
 *                       description: The resent registration code sent to the user.
 *                 responseMessage:
 *                   type: string
 *                   example: "Registration code resent successfully."
 *                   description: A message indicating the outcome of the operation.
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
  AUTH_ROUTES.RESEND_REGISTER_CODE,
  resendRegisterCode,
  successResponse
);

/**
 * @swagger
 * /auth/register-with-code:
 *   post:
 *     summary: Register with Code
 *     description: Registers the user using the received registration code.
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
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *                       description: The ID of the registered user.
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                 responseMessage:
 *                   type: string
 *                   example: "User registered successfully."
 *                   description: A message indicating the outcome of the operation.
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
 *                 example: ayubshikalgar2@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Bca@12345"
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

/**
 * @swagger
 * /auth/get-forgot-password-code:
 *   post:
 *     summary: Get Forgot Password Code
 *     description: Sends a verification code to reset the password.
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
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Forgot password code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     code:
 *                       type: string
 *                       example: "654321"
 *                       description: The forgot password code sent to the user.
 *                 responseMessage:
 *                   type: string
 *                   example: "Forgot password code sent successfully."
 *                   description: A message indicating the outcome of the operation.
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
  AUTH_ROUTES.GET_FORGOT_PASSWORD_CODE,
  getForgotPasswordCode,
  successResponse
);

/**
 * @swagger
 * /auth/change-password-with-code:
 *   post:
 *     summary: Change Password with Code
 *     description: Changes the password using the received verification code.
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
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *               confirmPassword:
 *                 type: string
 *                 example: newPassword456
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password changed successfully using verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                 responseMessage:
 *                   type: string
 *                   example: "Password changed successfully using verification code."
 *                   description: A message indicating the outcome of the operation.
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
  AUTH_ROUTES.CHANGE_PASSWORD_WITH_CODE,
  changePasswordWithCode,
  successResponse
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout User
 *     description: Logs out the currently authenticated user by clearing the JWT cookie.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *                 description: The ID of the user to logout.
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                       description: The ID of the logged-out user.
 *                 responseMessage:
 *                   type: string
 *                   example: "User logged out successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Bad request, missing required inputs
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
 *                   example: "Missing required inputs."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(AUTH_ROUTES.LOGOUT_USER, logoutUser, successResponse);

// Protected Routes

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change Password
 *     description: Changes the password for a user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *               confirmPassword:
 *                 type: string
 *                 example: newPassword456
 *             required:
 *               - userId
 *               - password
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "5f7d13a5-0768-4fa1-b77b-3b85c687a5f2"
 *                 responseMessage:
 *                   type: string
 *                   example: "Password changed successfully."
 *                   description: A message indicating the outcome of the operation.
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
  AUTH_ROUTES.CHANGE_PASSWORD,
  verifyToken,
  changePassword,
  successResponse
);

/**
 * @swagger
 * /auth/update-user-data-{userId}:
 *   put:
 *     summary: Update User
 *     description: Updates user information.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 // Define your response schema here
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
//TODO swagger update
router.put(AUTH_ROUTES.UPDATE_USER, verifyToken, updateUser, successResponse);

/**
 * @swagger
 * /auth/delete-user:
 *   delete:
 *     summary: Delete User
 *     description: Deletes a user account.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 // Define your response schema here
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
//TODO swagger update
router.delete(
  AUTH_ROUTES.DELETE_USER,
  verifyToken,
  deleteUser,
  successResponse
);

/**
 * @swagger
 * /auth/create-sub-user:
 *   post:
 *     summary: Create Sub User
 *     description: Creates a sub-user under the current authenticated user.
 *     tags:
 *       - Sub User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the authenticated user.
 *               emailId:
 *                 type: string
 *                 description: The username for the sub-user.
 *               organizationId:
 *                 type: string
 *                 description: The ID of the organization to which the sub-user belongs.
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of permissions assigned to the sub-user.
 *     responses:
 *       200:
 *         description: Sub-user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 organizationId:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 subUserRole:
 *                   type: string
 *                 generatedPassword:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(
  AUTH_ROUTES.AUTH_SUB_USER_GENERATION,
  verifyToken,
  createSubUser,
  successResponse
);

/**
 * @swagger
 * /auth/get-sub-user-by-id/{subUserId}:
 *   get:
 *     summary: Get Sub User by ID
 *     description: Retrieves details of a sub-user by their sub-user ID.
 *     tags:
 *       - Sub User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subUserId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the sub-user to retrieve.
 *     responses:
 *       200:
 *         description: Sub-user details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 subUserId:
 *                   type: string
 *                 subUsername:
 *                   type: string
 *                 organizationId:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 userRole:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Sub-user not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.get(
  AUTH_ROUTES.GET_SUB_USER_BY_ID,
  verifyToken,
  getSubUserById,
  successResponse
);

/**
 * @swagger
 * /auth/update-sub-user-permission:
 *   put:
 *     summary: Update Sub User Permissions
 *     description: Updates permissions for a sub-user.
 *     tags:
 *       - Sub User
 *     parameters:
 *       - in: path
 *         name: subUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the sub-user to update permissions for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["read", "write"]
 *                 description: The permissions to assign to the sub-user.
 *               userId:
 *                 type: string
 *                 example: "user123"
 *                 description: The ID of the main user.
 *               userRole:
 *                 type: string
 *                 example: "organizationOwner"
 *                 description: The role of the main user.
 *               isOrganizationOwner:
 *                 type: boolean
 *                 example: true
 *                 description: Whether the main user is an organization owner.
 *     responses:
 *       200:
 *         description: Sub user permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["read", "write"]
 *                       description: The updated permissions of the sub-user.
 *                 responseMessage:
 *                   type: string
 *                   example: "Permissions updated successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Bad request, invalid permissions or unauthorized access
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
 *                   example: "Invalid permissions."
 *       404:
 *         description: Sub user not found
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
 *                   example: "Sub user not found."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(
  AUTH_ROUTES.UPDATE_USER_PERMISSION,
  verifyToken,
  updateSubUserPermission,
  successResponse
);

/**
 * @swagger
 * /auth/get-sub-user-permission/{subUserId}:
 *   get:
 *     summary: Get Sub User Permissions
 *     description: Retrieves permissions of a sub-user.
 *     tags:
 *       - Sub User
 *     parameters:
 *       - in: path
 *         name: subUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the sub-user to retrieve permissions for.
 *     responses:
 *       200:
 *         description: Sub user permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["read", "write"]
 *                       description: The permissions of the sub-user.
 *                 responseMessage:
 *                   type: string
 *                   example: "Permissions retrieved successfully."
 *                   description: A message indicating the outcome of the operation.
 *       404:
 *         description: Sub user not found
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
 *                   example: "Sub user not found."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  AUTH_ROUTES.GET_SUB_USER_PERMISSION,
  verifyToken,
  getSubUserPermission,
  successResponse
);

/**
 * @swagger
 * /auth/change-sub-user-password:
 *   post:
 *     summary: Change Sub User Password
 *     description: Changes the password of a sub-user.
 *     tags:
 *       - Sub User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subUserId:
 *                 type: string
 *                 example: "subUser456"
 *                 description: The ID of the sub-user whose password is to be changed.
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *                 description: The new password for the sub-user.
 *               confirmPassword:
 *                 type: string
 *                 example: "newpassword123"
 *                 description: The confirmation of the new password.
 *     responses:
 *       200:
 *         description: Sub user password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                 responseMessage:
 *                   type: string
 *                   example: "Password changed successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Bad request, missing required inputs or invalid data
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
 *                   example: "Missing required inputs."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(
  AUTH_ROUTES.CHANGE_SUB_USER_PASSWORD,
  verifyToken,
  changeSubUserPassword,
  successResponse
);

/**
 * @swagger
 * /auth/sub-user-login-with-email-password:
 *   post:
 *     summary: Sub User Login with Email and Password
 *     description: Logs in a sub-user with email and password credentials.
 *     tags:
 *       - Sub User
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
 *                 description: The email of the main user account.
 *               subUsername:
 *                 type: string
 *                 example: subuser123
 *                 description: The username of the sub-user account.
 *               password:
 *                 type: string
 *                 example: password123
 *                 description: The password of the sub-user account.
 *     responses:
 *       200:
 *         description: Sub-user logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code of the response.
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     subUserId:
 *                       type: string
 *                       example: "subuser123"
 *                       description: The ID of the sub-user.
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                       description: The ID of the main user.
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                       description: The email of the main user.
 *                     role:
 *                       type: string
 *                       example: "subUser"
 *                       description: The role of the logged-in user.
 *                     isAuthUser:
 *                       type: boolean
 *                       example: false
 *                       description: Indicates if the user is the main authenticated user.
 *                     isOrganizationOwner:
 *                       type: boolean
 *                       example: false
 *                       description: Indicates if the user is the owner of the organization.
 *                 responseMessage:
 *                   type: string
 *                   example: "Sub-user logged in successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Bad request, missing required inputs or invalid credentials
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
 *                   example: "Missing required inputs."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(
  AUTH_ROUTES.SUB_USER_LOGIN_WITH_EMAIL_PASSWORD,
  subUserLoginWithEmailPassword,
  successResponse
);

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthSubUser:
 *       type: object
 *       required:
 *         - userId
 *         - organizationId
 *         - subUserId
 *         - subUsername
 *         - password
 *         - userRole
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique identifier of the parent user.
 *           example: "user123"
 *         organizationId:
 *           type: string
 *           description: Unique identifier of the organization.
 *           example: "org456"
 *         subUserId:
 *           type: string
 *           description: Unique identifier of the sub user.
 *           example: "subuser789"
 *         subUsername:
 *           type: string
 *           description: Username of the sub user.
 *           example: "subuser"
 *         password:
 *           type: string
 *           description: Password of the sub user.
 *           example: "password123"
 *         userRole:
 *           type: string
 *           description: Role of the sub user.
 *           example: "ProjectLead"
 *           enum:
 *             - "Read"
 *             - "Write"
 *             - "Read&Write"
 *             - "Owner"
 *             - "ProjectLead"
 *         permissions:
 *           type: array
 *           description: List of permissions granted to the sub user.
 *           items:
 *             type: string
 *             enum:
 *               - "Read"
 *               - "Write"
 *               - "Read&Write"
 *               - "Owner"
 *               - "ProjectLead"
 *           example:
 *             - "Read"
 *           default:
 *             - "Read"
 *       example:
 *         userId: "user123"
 *         organizationId: "org456"
 *         subUserId: "subuser789"
 *         subUsername: "subuser"
 *         password: "password123"
 *         userRole: "ProjectLead"
 *         permissions:
 *           - "Read"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userId
 *         - userName
 *         - shortCode
 *         - email
 *         - phoneNumber
 *         - previousEmails
 *         - password
 *         - userRole
 *         - isBlocked
 *         - logins
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique identifier of the user.
 *           example: "user123"
 *         userName:
 *           type: string
 *           description: Username of the user.
 *           example: "username"
 *         shortCode:
 *           type: string
 *           description: Short code identifier of the user.
 *           example: "abc123"
 *         email:
 *           type: string
 *           description: Email address of the user.
 *           example: "user@example.com"
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the user.
 *           example: "+1234567890"
 *         previousEmails:
 *           type: array
 *           description: List of previous email addresses used by the user.
 *           items:
 *             type: string
 *           example: ["old@example.com"]
 *         password:
 *           type: string
 *           description: Password of the user.
 *           example: "password123"
 *         userRole:
 *           type: string
 *           description: Role of the user.
 *           example: "Admin"
 *         isBlocked:
 *           type: boolean
 *           description: Indicates if the user is blocked.
 *           example: false
 *         logins:
 *           type: array
 *           description: List of login timestamps.
 *           items:
 *             type: string
 *           example: ["2024-01-01T12:00:00.000Z"]
 *         emailVerification:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Verification code for email verification.
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when verification code was created.
 *             attempts:
 *               type: number
 *               description: Number of attempts made for email verification.
 *             verified:
 *               type: boolean
 *               description: Indicates if email is verified.
 *             verifiedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when email was verified.
 *         forgotPassowrdVerification:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Verification code for forgot password process.
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when verification code was created.
 *             attempts:
 *               type: number
 *               description: Number of attempts made for forgot password.
 *             verified:
 *               type: boolean
 *               description: Indicates if forgot password process is verified.
 *             verifiedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when forgot password process was verified.
 *         changeEmailVerification:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Verification code for changing email address.
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when verification code was created.
 *             attempts:
 *               type: number
 *               description: Number of attempts made for changing email address.
 *             verified:
 *               type: boolean
 *               description: Indicates if changing email address is verified.
 *             verifiedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when changing email address was verified.
 *             currentEmailCode:
 *               type: string
 *               description: Current verification code for the current email.
 *             newEmail:
 *               type: string
 *               description: New email address to be verified.
 *       example:
 *         userId: "user123"
 *         userName: "username"
 *         shortCode: "abc123"
 *         email: "user@example.com"
 *         phoneNumber: "+1234567890"
 *         previousEmails: ["old@example.com"]
 *         password: "password123"
 *         userRole: "Admin"
 *         isBlocked: false
 *         logins: ["2024-01-01T12:00:00.000Z"]
 *         emailVerification:
 *           code: "verificationcode123"
 *           createdAt: "2024-01-01T12:00:00.000Z"
 *           attempts: 0
 *           verified: false
 *         forgotPassowrdVerification:
 *           code: "forgotpasswordcode123"
 *           createdAt: "2024-01-01T12:00:00.000Z"
 *           attempts: 0
 *           verified: false
 *         changeEmailVerification:
 *           code: "changeemailcode123"
 *           createdAt: "2024-01-01T12:00:00.000Z"
 *           attempts: 0
 *           verified: false
 *           currentEmailCode: "currentemailcode123"
 *           newEmail: "newemail@example.com"
 */

export default router;
