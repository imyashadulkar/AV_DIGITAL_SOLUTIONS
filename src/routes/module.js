import express from "express";

import { validateTokenResponse } from "../controllers/auth.js";
import { AUTH_ROUTES, MODULE_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";
import {
  getOrganization,
  setOrganization,
} from "../controllers/organization.js";

const router = express.Router();

// Unprotected Routes

/**
 * @swagger
 * /auth/organization:
 *   post:
 *     summary: Set Organization
 *     description: Creates or updates organization details for a user.
 *     tags:
 *       - Organization
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
 *                 description: The ID of the user setting the organization details.
 *               organizationName:
 *                 type: string
 *                 example: "Acme Inc."
 *                 description: The name of the organization.
 *               departmentName:
 *                 type: string
 *                 example: "IT"
 *                 description: The department name within the organization.
 *               organizationContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   mobile:
 *                     type: string
 *                     example: "+1234567890"
 *                   email:
 *                     type: string
 *                     example: "contact@example.com"
 *                 description: Contact information for the organization.
 *               organizationAddress:
 *                 type: object
 *                 properties:
 *                   addressLine1:
 *                     type: string
 *                     example: "123 Main St."
 *                   addressLine2:
 *                     type: string
 *                     example: "Apt 101"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *                   pincode:
 *                     type: string
 *                     example: "10001"
 *                 description: Address details of the organization.
 *     responses:
 *       200:
 *         description: Organization details set successfully
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
 *                     registeredOn:
 *                       type: string
 *                       example: "2024-06-23T10:30:00Z"
 *                       description: Date when user's email was verified.
 *                     licenseValidity:
 *                       type: string
 *                       example: "2025-06-23T00:00:00Z"
 *                       description: Validity of the organization's license.
 *                     subUsers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                       description: List of sub-users under the organization.
 *                     accountStatus:
 *                       type: boolean
 *                       example: true
 *                       description: Current status of the organization's account.
 *                     allowToChangeTimeZone:
 *                       type: boolean
 *                       example: false
 *                       description: Whether the organization is allowed to change time zone.
 *                     organizationName:
 *                       type: string
 *                       example: "Acme Inc."
 *                       description: The name of the organization.
 *                     departmentName:
 *                       type: string
 *                       example: "IT"
 *                       description: The department name within the organization.
 *                     organizationContact:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         mobile:
 *                           type: string
 *                           example: "+1234567890"
 *                         email:
 *                           type: string
 *                           example: "contact@example.com"
 *                       description: Contact information for the organization.
 *                     organizationAddress:
 *                       type: object
 *                       properties:
 *                         addressLine1:
 *                           type: string
 *                           example: "123 Main St."
 *                         addressLine2:
 *                           type: string
 *                           example: "Apt 101"
 *                         city:
 *                           type: string
 *                           example: "New York"
 *                         state:
 *                           type: string
 *                           example: "NY"
 *                         country:
 *                           type: string
 *                           example: "USA"
 *                         pincode:
 *                           type: string
 *                           example: "10001"
 *                       description: Address details of the organization.
 *                 responseMessage:
 *                   type: string
 *                   example: "Organization details updated successfully."
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(
  MODULE_ROUTES.SET_ORGANIZATION,
  verifyToken,
  setOrganization,
  successResponse
);

/**
 * @swagger
 * /auth/organization:
 *   get:
 *     summary: Get Organization
 *     description: Retrieves organization details for a user.
 *     tags:
 *       - Organization
 *     parameters:
 *       - in: body
 *         name: userId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               example: "user123"
 *               description: The ID of the user whose organization details are to be retrieved.
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
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
 *                     registeredOn:
 *                       type: string
 *                       example: "2024-06-23T10:30:00Z"
 *                       description: Date when user's email was verified.
 *                     licenseValidity:
 *                       type: string
 *                       example: "2025-06-23T00:00:00Z"
 *                       description: Validity of the organization's license.
 *                     subUsers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                       description: List of sub-users under the organization.
 *                     accountStatus:
 *                       type: boolean
 *                       example: true
 *                       description: Current status of the organization's account.
 *                     allowToChangeTimeZone:
 *                       type: boolean
 *                       example: false
 *                       description: Whether the organization is allowed to change time zone.
 *                     organizationName:
 *                       type: string
 *                       example: "Acme Inc."
 *                       description: The name of the organization.
 *                     departmentName:
 *                       type: string
 *                       example: "IT"
 *                       description: The department name within the organization.
 *                     organizationContact:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         mobile:
 *                           type: string
 *                           example: "+1234567890"
 *                         email:
 *                           type: string
 *                           example: "contact@example.com"
 *                       description: Contact information for the organization.
 *                     organizationAddress:
 *                       type: object
 *                       properties:
 *                         addressLine1:
 *                           type: string
 *                           example: "123 Main St."
 *                         addressLine2:
 *                           type: string
 *                           example: "Apt 101"
 *                         city:
 *                           type: string
 *                           example: "New York"
 *                         state:
 *                           type: string
 *                           example: "NY"
 *                         country:
 *                           type: string
 *                           example: "USA"
 *                         pincode:
 *                           type: string
 *                           example: "10001"
 *                       description: Address details of the organization.
 *                     licenseData:
 *                       type: object
 *                       properties:
 *                         validity:
 *                           type: string
 *                           example: "2025-06-23T00:00:00Z"
 *                           description: Validity of the organization's license.
 *                         subUsers:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                           description: List of sub-users under the organization.
 *                         orderId:
 *                           type: string
 *                           example: "order123"
 *                           description: Order ID related to the organization's license.
 *                         approvedBy:
 *                           type: string
 *                           example: "admin123"
 *                           description: ID of the admin who approved the license.
 *                         approverRemarks:
 *                           type: string
 *                           example: "Approved for 1 year."
 *                           description: Remarks provided by the approver.
 *                         previousValidityMap:
 *                           type: object
 *                           example: {}
 *                           description: Map of previous validity dates for the organization's license.
 *                     lastLoginAt:
 *                       type: string
 *                       example: "2024-06-23T10:30:00Z"
 *                       description: Date and time of the user's last login.
 *                     logins:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["2024-06-23"]
 *                       description: List of dates when the user logged in.
 *                     shortCode:
 *                       type: string
 *                       example: "ABC123"
 *                       description: Short code associated with the user.
 *                 responseMessage:
 *                   type: string
 *                   example: "Organization details retrieved successfully."
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.get(
  MODULE_ROUTES.GET_ORGANIZATION,
  verifyToken,
  getOrganization,
  successResponse
);

export default router;
