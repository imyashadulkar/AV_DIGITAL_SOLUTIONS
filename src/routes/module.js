import express from "express";

import { MODULE_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";
import {
  getOrganization,
  setOrganization,
} from "../controllers/organization/organization.js";
import {
  addUserToProject,
  changeProjectAndRole,
  changeUserRoleInProject,
  createProject,
} from "../controllers/organization/project.js";

const router = express.Router();

/**
 * @swagger
 * /module/set-organization:
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
 * /module/get-organization:
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
 *               example: "ecd1f041-742e-446a-8617-55060cef2545"
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

/**
 * @swagger
 * /module/create-project:
 *   post:
 *     summary: Create Project
 *     description: Creates a new project within the organization.
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               projectName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 201
 *                 responseData:
 *                   $ref: '#/components/schemas/Organization'
 *                 responseMessage:
 *                   type: string
 *                   example: "Project created successfully."
 *       400:
 *         description: Bad request, missing required inputs.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  MODULE_ROUTES.CREATE_PROJECT,
  verifyToken,
  createProject,
  successResponse
);

/**
 * @swagger
 * /module/add-user-to-project:
 *   post:
 *     summary: Add User to Project
 *     description: Adds a user with a specified role to a project.
 *     tags: [Organization]
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization.
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project.
 *       - in: query
 *         name: subuserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to be added.
 *       - in: query
 *         name: userRole
 *         required: true
 *         schema:
 *           type: string
 *         description: The role of the user in the project (e.g., admin, read, write).
 *     responses:
 *       200:
 *         description: User added to project successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                 responseData:
 *                   $ref: '#/components/schemas/Organization'
 *                 responseMessage:
 *                   type: string
 *                   example: "User added to project successfully."
 *       400:
 *         description: Bad request, missing required inputs.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.post(
  MODULE_ROUTES.ADD_USER_TO_PROJECT,
  verifyToken,
  addUserToProject,
  successResponse
);

/**
 * @swagger
 * /module/change-user-role-in-project:
 *   put:
 *     summary: Change User Role in Project
 *     description: Changes the role of a user in a project.
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User role changed successfully in project.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                 responseData:
 *                   $ref: '#/components/schemas/Organization'
 *                 responseMessage:
 *                   type: string
 *                   example: "User role changed successfully in project."
 *       400:
 *         description: Bad request, missing required inputs.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  MODULE_ROUTES.CHANGE_USER_ROLE_IN_PROJECT,
  verifyToken,
  changeUserRoleInProject,
  successResponse
);

/**
 * @swagger
 * /module/change-project-and-role:
 *   put:
 *     summary: Change Project and User Role
 *     description: Retrieves project details and user role within that project.
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project details and user role retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     currentProject:
 *                       $ref: '#/components/schemas/Project'
 *                     userRole:
 *                       type: string
 *                   description: Current project details and user role.
 *                 responseMessage:
 *                   type: string
 *                   example: "Project details and user role retrieved successfully."
 *       400:
 *         description: Bad request, missing required inputs.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  MODULE_ROUTES.CHANGE_PROJECT_AND_ROLE,
  verifyToken,
  changeProjectAndRole,
  successResponse
);

export default router;
