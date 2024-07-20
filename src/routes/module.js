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
  getAllUserInProject,
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

/**
 * @swagger
 * /module/get-all-user-in-project:
 *   get:
 *     summary: Get All Users in Project
 *     description: Retrieves all users in a project.
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
 *     responses:
 *       200:
 *         description: Users in project retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuscode:
 *                   type: integer
 *                   example: 200
 *                 responseData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                   description: List of users in the project.
 *                 responseMessage:
 *                   type: string
 *                   example: "Users in project retrieved successfully."
 *       400:
 *         description: Bad request, missing required inputs.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  MODULE_ROUTES.GET_ALL_USER_IN_PROJECT,
  verifyToken,
  getAllUserInProject,
  successResponse
);

/**
 * @swagger
 * components:
 *   schemas:
 *     License:
 *       type: object
 *       required:
 *         - userId
 *         - orderId
 *         - currentValidity
 *         - validityLastUpdatedAt
 *         - approvedBy
 *         - approverRemarks
 *         - isActive
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user associated with the license.
 *           example: "user123"
 *         orderId:
 *           type: string
 *           description: ID of the order related to the license.
 *           example: "ORD123456"
 *         currentValidity:
 *           type: string
 *           description: Current validity date of the license.
 *           example: "2024-12-31"
 *         validityLastUpdatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the validity was last updated.
 *           example: "2024-07-15T12:00:00.000Z"
 *         approvedBy:
 *           type: string
 *           description: Name of the approver who approved the license.
 *           example: "John Doe"
 *         subUsers:
 *           type: array
 *           description: List of sub-users associated with the license.
 *           items:
 *             type: string
 *           example: ["subuser1", "subuser2"]
 *         approverRemarks:
 *           type: string
 *           description: Remarks provided by the approver.
 *           example: "Approved for next year renewal."
 *         previousValidityMap:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/PreviousValidity'
 *           description: Map containing previous validity information.
 *         isActive:
 *           type: boolean
 *           description: Indicates if the license is active.
 *           example: true
 *       example:
 *         userId: "user123"
 *         orderId: "ORD123456"
 *         currentValidity: "2024-12-31"
 *         validityLastUpdatedAt: "2024-07-15T12:00:00.000Z"
 *         approvedBy: "John Doe"
 *         subUsers: ["subuser1", "subuser2"]
 *         approverRemarks: "Approved for next year renewal."
 *         previousValidityMap: {}
 *         isActive: true
 *
 *     PreviousValidity:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: ID of the order related to the previous validity.
 *           example: "ORD789012"
 *         currentValidity:
 *           type: string
 *           description: Previous validity date.
 *           example: "2023-12-31"
 *         validityLastUpdatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the previous validity was last updated.
 *           example: "2024-07-14T12:00:00.000Z"
 *         approvedBy:
 *           type: string
 *           description: Name of the approver who approved the previous validity.
 *           example: "Jane Smith"
 *         approverRemarks:
 *           type: string
 *           description: Remarks provided by the approver for the previous validity.
 *           example: "Approved for current year extension."
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       properties:
 *         subuserId:
 *           type: string
 *           description: ID of the subuser associated with the role.
 *           example: "subuser123"
 *         role:
 *           type: string
 *           enum: ["read", "write", "admin"]
 *           description: Role assigned to the subuser within the organization.
 *           example: "admin"
 *
 *     Project:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           description: ID of the project.
 *           example: "project123"
 *         projectName:
 *           type: string
 *           description: Name of the project.
 *           example: "Project A"
 *         subUsers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserRole'
 *           description: List of subusers and their roles within the project.
 *           example:
 *             - subuserId: "subuser123"
 *               role: "admin"
 *
 *     OrganizationContact:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the organization contact.
 *           example: "John Doe"
 *         mobile:
 *           type: string
 *           description: Mobile number of the organization contact.
 *           example: "+1234567890"
 *         email:
 *           type: string
 *           description: Email address of the organization contact.
 *           example: "john.doe@example.com"
 *
 *     OrganizationAddress:
 *       type: object
 *       properties:
 *         addressLine1:
 *           type: string
 *           description: Address line 1 of the organization.
 *           example: "123 Main St"
 *         addressLine2:
 *           type: string
 *           description: Address line 2 of the organization.
 *           example: "Apt 101"
 *         city:
 *           type: string
 *           description: City of the organization's address.
 *           example: "New York"
 *         state:
 *           type: string
 *           description: State or province of the organization's address.
 *           example: "NY"
 *         country:
 *           type: string
 *           description: Country of the organization's address.
 *           example: "USA"
 *         pincode:
 *           type: string
 *           description: Postal code or ZIP code of the organization's address.
 *           example: "10001"
 *
 *     Organization:
 *       type: object
 *       required:
 *         - userId
 *         - organizationId
 *         - organizationName
 *         - departmentName
 *         - organizationContact
 *         - organizationAddress
 *         - projects
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user associated with the organization.
 *           example: "user123"
 *         organizationId:
 *           type: string
 *           description: ID of the organization.
 *           example: "org123"
 *         subUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: List of IDs of subusers associated with the organization.
 *           example:
 *             - "subuser123"
 *         organizationName:
 *           type: string
 *           description: Name of the organization.
 *           example: "XYZ Corp"
 *         departmentName:
 *           type: string
 *           description: Name of the department within the organization.
 *           example: "Marketing"
 *         organizationContact:
 *           $ref: '#/components/schemas/OrganizationContact'
 *         organizationAddress:
 *           $ref: '#/components/schemas/OrganizationAddress'
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Project'
 *           description: List of projects associated with the organization.
 *           example:
 *             - projectId: "project123"
 *               projectName: "Project A"
 *               subUsers:
 *                 - subuserId: "subuser123"
 *                   role: "admin"
 *       example:
 *         userId: "user123"
 *         organizationId: "org123"
 *         subUsers: ["subuser123"]
 *         organizationName: "XYZ Corp"
 *         departmentName: "Marketing"
 *         organizationContact:
 *           name: "John Doe"
 *           mobile: "+1234567890"
 *           email: "john.doe@example.com"
 *         organizationAddress:
 *           addressLine1: "123 Main St"
 *           city: "New York"
 *           state: "NY"
 *           country: "USA"
 *           pincode: "10001"
 *         projects:
 *           - projectId: "project123"
 *             projectName: "Project A"
 *             subUsers:
 *               - subuserId: "subuser123"
 *                 role: "admin"
 */

export default router;
