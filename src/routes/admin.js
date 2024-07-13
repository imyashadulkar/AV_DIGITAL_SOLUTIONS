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
  updateUserStatus,
} from "../controllers/admin/admincontroller.js";
import { ADMIN_ROUTES } from "../helpers/constants.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

// Create an instance of the router
const router = express.Router();

/**
 * @swagger
 * /admin/get-admin-login-code:
 *   post:
 *     summary: Get Admin Login Code
 *     description: Sends an OTP verification code to the admin user's email for login.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The admin user's email address.
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 description: The admin user's password.
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       properties:
 *                         OTP:
 *                           type: string
 *                           example: "123456"
 *                           description: The OTP sent to the admin user's email.
 *                     responseMessage:
 *                       type: string
 *                       example: "Admin login code sent successfully."
 *                       description: A message indicating the OTP was sent successfully.
 *       400:
 *         description: Missing required inputs (email or password)
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
 *                   example: "Missing required inputs. Please provide email and password."
 *       404:
 *         description: Admin user not found
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
 *                   example: "User not found."
 *       401:
 *         description: Invalid credentials
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
 *                   example: "Invalid credentials."
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
  ADMIN_ROUTES.GET_ADMIN_LOGIN_CODE,
  getAdminLoginCode,
  successResponse
);

/**
 * @swagger
 * /admin/admin-login-with-code:
 *   post:
 *     summary: Admin Login with Code
 *     description: Authenticates an admin user using their email, password, and a verification code.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The admin user's email address.
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 description: The admin user's password.
 *                 example: "password123"
 *               code:
 *                 type: string
 *                 description: The verification code sent to the admin user's email.
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Admin user logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "userId123"
 *                           description: The admin user's ID.
 *                         email:
 *                           type: string
 *                           example: "admin@example.com"
 *                           description: The admin user's email address.
 *                         role:
 *                           type: string
 *                           example: "admin"
 *                           description: The role of the user.
 *                     responseMessage:
 *                       type: string
 *                       example: "User logged in successfully."
 *                       description: A message indicating successful login.
 *       400:
 *         description: Missing required inputs (email, password, or code)
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
 *                   example: "Missing required inputs. Please provide email, password, and code."
 *       404:
 *         description: Admin user not found
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
 *                   example: "User not found."
 *       401:
 *         description: Invalid credentials or verification code
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
 *                   example: "Invalid credentials or verification code."
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
  ADMIN_ROUTES.ADMIN_LOGIN_WITH_CODE,
  adminLoginWithCode,
  successResponse
);

/**
 * @swagger
 * /admin/login-with-email-password-admin:
 *   post:
 *     summary: Admin Login with Email and Password
 *     description: Authenticates an admin user using their email and password.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The admin user's email address.
 *                 example: "admin@razzaq.com"
 *               password:
 *                 type: string
 *                 description: The admin user's password.
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Admin user logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "userId123"
 *                           description: The admin user's ID.
 *                         email:
 *                           type: string
 *                           example: "admin@example.com"
 *                           description: The admin user's email address.
 *                         role:
 *                           type: string
 *                           example: "admin"
 *                           description: The role of the user.
 *                     responseMessage:
 *                       type: string
 *                       example: "User logged in successfully."
 *                       description: A message indicating successful login.
 *       400:
 *         description: Missing required inputs (email or password)
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
 *                   example: "Missing required inputs. Please provide email and password."
 *       404:
 *         description: Admin user not found
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
 *                   example: "User not found."
 *       401:
 *         description: Invalid credentials
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
 *                   example: "Invalid credentials."
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
  ADMIN_ROUTES.LOGIN_WITH_EMAIL_PASSWORD_ADMIN,
  loginWithEmailPasswordAdmin,
  successResponse
);

/**
 * @swagger
 * /admin/get-all-users:
 *   get:
 *     summary: Get All Users
 *     description: Retrieves all users, separating them into registered and unregistered categories.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       properties:
 *                         registeredUsers:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 5
 *                               description: Number of registered users.
 *                             users:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   userId:
 *                                     type: string
 *                                     example: "userId123"
 *                                     description: The user's ID.
 *                                   email:
 *                                     type: string
 *                                     example: "user@example.com"
 *                                     description: The user's email.
 *                                   userName:
 *                                     type: string
 *                                     example: "username"
 *                                     description: The user's username.
 *                                   password:
 *                                     type: string
 *                                     example: "hashedPassword"
 *                                     description: The user's hashed password.
 *                                   phoneNumber:
 *                                     type: string
 *                                     example: "1234567890"
 *                                     description: The user's phone number.
 *                                   userRole:
 *                                     type: string
 *                                     example: "user"
 *                                     description: The user's role.
 *                                   isBlocked:
 *                                     type: boolean
 *                                     example: false
 *                                     description: Indicates if the user is blocked.
 *                                   registeredOn:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2024-01-01T00:00:00.000Z"
 *                                     description: The date and time the user registered.
 *                                   lastLoginAt:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2024-01-01T00:00:00.000Z"
 *                                     description: The date and time of the user's last login.
 *                         unRegisteredUsers:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 3
 *                               description: Number of unregistered users.
 *                             users:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   userId:
 *                                     type: string
 *                                     example: "userId456"
 *                                     description: The user's ID.
 *                                   email:
 *                                     type: string
 *                                     example: "user2@example.com"
 *                                     description: The user's email.
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2024-01-01T00:00:00.000Z"
 *                                     description: The date and time the user was created.
 *                     responseMessage:
 *                       type: string
 *                       example: "All users retrieved successfully."
 *                       description: A message indicating the outcome of the operation.
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

router.get(
  ADMIN_ROUTES.GET_ALL_USERS,
  verifyToken,
  verifyAdmin,
  getAllUsers,
  successResponse
);

/**
 * @swagger
 * /admin/get-user-by-id/{userId}:
 *   get:
 *     summary: Get User by ID
 *     description: Retrieves user details by user ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                               example: "userId123"
 *                               description: The user's ID.
 *                             email:
 *                               type: string
 *                               example: "user@example.com"
 *                               description: The user's email.
 *                             userName:
 *                               type: string
 *                               example: "username"
 *                               description: The user's username.
 *                             password:
 *                               type: string
 *                               example: "hashedPassword"
 *                               description: The user's hashed password.
 *                             phoneNumber:
 *                               type: string
 *                               example: "1234567890"
 *                               description: The user's phone number.
 *                             userRole:
 *                               type: string
 *                               example: "user"
 *                               description: The user's role.
 *                             isBlocked:
 *                               type: boolean
 *                               example: false
 *                               description: Indicates if the user is blocked.
 *                             registeredOn:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-01-01T00:00:00.000Z"
 *                               description: The date and time the user registered.
 *                             lastLoginAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-01-01T00:00:00.000Z"
 *                               description: The date and time of the user's last login.
 *                             logins:
 *                               type: array
 *                               items:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-01-01T00:00:00.000Z"
 *                                 description: List of login timestamps.
 *                     responseMessage:
 *                       type: string
 *                       example: "User details retrieved successfully."
 *                       description: A message indicating the outcome of the operation.
 *       400:
 *         description: Missing required inputs (userId)
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
 *                   example: "Missing required inputs. Please provide a user ID."
 *       404:
 *         description: User not found
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
 *                   example: "User not found."
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

router.get(
  ADMIN_ROUTES.GET_USER_BY_ID,
  verifyToken,
  verifyAdmin,
  getUserById,
  successResponse
);

/**
 * @swagger
 * /admin/set-license-data-by-id:
 *   post:
 *     summary: Set License Data by User ID
 *     description: Sets license data for a user identified by user ID.
 *     tags:
 *       - License Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endUserId:
 *                 type: string
 *                 example: "ecd1f041-742e-446a-8617-55060cef2545"
 *                 description: userId of enduser.
 *               validity:
 *                 type: string
 *                 example: "2024-12-31"
 *                 description: The validity date of the license.
 *               approvedBy:
 *                 type: string
 *                 example: "Razzaq Shikalgar"
 *                 description: The name of the approver.
 *               approverRemarks:
 *                 type: string
 *                 example: "Approved for next year renewal."
 *                 description: Remarks provided by the approver.
 *               orderId:
 *                 type: string
 *                 example: "ORD123456"
 *                 description: The ID of the order related to the license.
 *               subUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: "sub user count"
 *                 description: List of sub-users associated with the license.
 *     responses:
 *       200:
 *         description: License data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       properties:
 *                         licenseData:
 *                           type: object
 *                           description: The updated license data object.
 *                     responseMessage:
 *                       type: string
 *                       example: "License details updated successfully."
 *                       description: A message indicating the outcome of the operation.
 *       400:
 *         description: Missing required inputs (validity, approvedBy, approverRemarks, orderId)
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
 *                   example: "Missing required inputs. Please provide validity, approvedBy, approverRemarks, and orderId."
 *       404:
 *         description: User not found or license not found
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
 *                   example: "User not found or license not found."
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
  ADMIN_ROUTES.SET_LICENSE_DATA_BY_ID,
  verifyToken,
  verifyAdmin,
  setLicenseDataById,
  successResponse
);

/**
 * @swagger
 * /admin/get-all-users-license-data:
 *   get:
 *     summary: Get All User Licenses
 *     description: Retrieves license details for all users.
 *     tags:
 *       - License Management
 *     responses:
 *       200:
 *         description: User licenses retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                         description: The ID of the user.
 *                       currentValidity:
 *                         type: string
 *                         example: "2024-12-31"
 *                         description: The current validity date of the license.
 *                       validityLastUpdatedAt:
 *                         type: string
 *                         example: "2024-06-25T08:30:00.000Z"
 *                         description: The date and time when validity was last updated.
 *                       previousValidity:
 *                         type: object
 *                         example: {}
 *                         description: Map of previous validity periods (if available).
 *                       approvedBy:
 *                         type: string
 *                         example: "John Doe"
 *                         description: The name of the approver for the license.
 *                       orderId:
 *                         type: string
 *                         example: "ORD123456"
 *                         description: The ID of the order related to the license.
 *                       approverRemarks:
 *                         type: string
 *                         example: "Approved for next year renewal."
 *                         description: Remarks provided by the approver.
 *                 responseMessage:
 *                   type: string
 *                   example: "User licenses retrieved successfully."
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

router.get(
  ADMIN_ROUTES.GET_ALL_USERS_LICENSE_DATA,
  verifyToken,
  verifyAdmin,
  getAllUsersLicenseData,
  successResponse
);

/**
 * @swagger
 * /admin/get-user-license-detail/{userId}:
 *   get:
 *     summary: Get User License Detail by User ID
 *     description: Retrieves license details for a user identified by user ID.
 *     tags:
 *       - License Management
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to fetch license details for.
 *     responses:
 *       200:
 *         description: License details retrieved successfully
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
 *                       description: The ID of the user.
 *                     currentValidity:
 *                       type: string
 *                       example: "2024-12-31"
 *                       description: The current validity date of the license.
 *                     validityLastUpdatedAt:
 *                       type: string
 *                       example: "2024-06-25T08:30:00.000Z"
 *                       description: The date and time when validity was last updated.
 *                     previousValidity:
 *                       type: object
 *                       example: {}
 *                       description: Map of previous validity periods (if available).
 *                     approvedBy:
 *                       type: string
 *                       example: "John Doe"
 *                       description: The name of the approver for the license.
 *                 responseMessage:
 *                   type: string
 *                   example: "User license details retrieved successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Missing required inputs (userId)
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
 *                   example: "Missing required inputs. Please provide userId."
 *       404:
 *         description: License not found for the specified user ID
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
 *                   example: "License not found for the specified user ID."
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

router.get(
  ADMIN_ROUTES.GET_USER_LICENSE_DATA_BY_ID,
  verifyToken,
  verifyAdmin,
  getUserLicenseDetailById,
  successResponse
);

/**
 * @swagger
 * /admin/update-user-status:
 *   post:
 *     summary: Update User Status
 *     description: Updates various status types (active, block, timezone, shortCode) for a user.
 *     tags:
 *       - User Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endUserId:
 *                 type: string
 *                 example: "user123"
 *                 description: The ID of the user to update status for.
 *               type:
 *                 type: string
 *                 enum: [active, block, timezone, shortCode]
 *                 example: "active"
 *                 description: The type of status to update.
 *               action:
 *                 type: boolean
 *                 example: true
 *                 description: The action to perform (true for enable, false for disable).
 *               shortCode:
 *                 type: string
 *                 example: "ABCD"
 *                 description: The short code to set for the user (required for type 'shortCode').
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                       description: The updated active status of the user.
 *                     isBlocked:
 *                       type: boolean
 *                       example: false
 *                       description: The updated blocked status of the user.
 *                     allowToChangeTimeZone:
 *                       type: boolean
 *                       example: true
 *                       description: The updated timezone change permission status of the user.
 *                     shortCode:
 *                       type: string
 *                       example: "ABCD"
 *                       description: The updated short code of the user.
 *                 responseMessage:
 *                   type: string
 *                   example: "User status updated successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Missing required inputs (endUserId, type, action)
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
 *                   example: "Missing required inputs. Please provide endUserId, type, and action."
 *       404:
 *         description: User not found
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
 *                   example: "User not found."
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
  ADMIN_ROUTES.UPDATE_USER_STATUS,
  verifyToken,
  verifyAdmin,
  updateUserStatus,
  successResponse
);

/**
 * @swagger
 * /auth/logout-admin:
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

router.post(
  ADMIN_ROUTES.LOGOUT_ADMIN,
  verifyToken,
  verifyAdmin,
  logoutAdmin,
  successResponse
);

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUser:
 *       type: object
 *       required:
 *         - userId
 *         - email
 *         - password
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique identifier for the admin user.
 *           example: "ecd1f041-742e-446a-8617-55060cef2545"
 *         email:
 *           type: string
 *           description: Email address of the admin user.
 *           example: "admin@example.com"
 *         password:
 *           type: string
 *           description: Password of the admin user.
 *           example: "password123"
 *         logins:
 *           type: array
 *           description: Array of login timestamps.
 *           items:
 *             type: string
 *             format: date-time
 *             example: "2024-07-15T08:00:00Z"
 *         emailVerification:
 *           type: object
 *           description: Object containing email verification details.
 *           properties:
 *             code:
 *               type: string
 *               description: Verification code hashed value.
 *               example: "$2a$10$YvC4L7i8jCGn5Soq0Wp0eeH5nZZq2bBtfd6ckFtW5rbd5ZAMOnWlW"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Date and time when the verification code was created.
 *               example: "2024-07-15T08:00:00Z"
 *             attempts:
 *               type: integer
 *               description: Number of verification attempts.
 *               example: 0
 *             verified:
 *               type: boolean
 *               description: Indicates if the email has been verified.
 *               example: false
 *             verifiedAt:
 *               type: string
 *               format: date-time
 *               description: Date and time when the email was verified.
 *               example: "2024-07-15T08:00:00Z"
 */



export default router;
