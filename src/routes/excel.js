import express from "express";
import { upload } from "../middleware/multer.js";

import {
  assignLead,
  createLead,
  deleteLead,
  extractDataFromExcel,
  getAllLeads,
  getLeadById,
  leadFollowUp,
  saveAgentDetails,
  saveContactDetails,
  updateLeadStatus,
} from "../controllers/excelapi.js";
import {
  EXCEL_ROUTES,
  GOOGLE_SHEETS_API,
  LEADS_ROUTES,
} from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

const router = express.Router();

/**
 * @swagger
 * /crm/get-data-from-excel/{projectId}:
 *   post:
 *     summary: Extract data from Excel file and save to database
 *     description: Extracts data from an uploaded Excel file, processes it, and saves it to the database under the specified project.
 *     tags:
 *       - Data Extraction
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project where the leads should be saved.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               excelFile:
 *                 type: string
 *                 format: binary
 *                 description: The Excel file to extract data from.
 *               organizationId:
 *                 type: string
 *                 description: The ID of the organization to which the leads belong.
 *     responses:
 *       200:
 *         description: Data extracted and saved successfully
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
 *                   example: "Data extracted and saved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuscode:
 *                       type: integer
 *                       example: 200
 *                       description: HTTP status code of the response.
 *                     responseData:
 *                       type: object
 *                       example: {}
 *                       description: Response data from the database operation.
 *                     responseMessage:
 *                       type: string
 *                       example: "Data saved successfully."
 *                       description: A message indicating the outcome of the operation.
 *       400:
 *         description: Missing required inputs (Excel file, userId, or organizationId)
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
 *                   example: "Missing required inputs. Please upload an Excel file and provide userId and organizationId."
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
  EXCEL_ROUTES.GET_DATA_FROM_EXCEL,
  verifyToken,
  extractDataFromExcel,
  successResponse
);

/**
 * @swagger
 * /crm/create-single-lead:
 *   post:
 *     summary: Create a new lead
 *     description: Creates a new lead with the provided details and saves it to the database, associating it with a specific project in a given organization.
 *     tags:
 *       - Leads
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         description: The ID of the project where the lead should be added.
 *         schema:
 *           type: string
 *           example: "abcdef1234567890"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 example: "Facebook"
 *                 description: The platform where the lead was acquired.
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: The phone number of the lead.
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: The full name of the lead.
 *               campaign_name:
 *                 type: string
 *                 example: "Summer Sale"
 *                 description: The name of the campaign associated with the lead.
 *               ad_name:
 *                 type: string
 *                 example: "Ad123"
 *                 description: The name of the ad that generated the lead.
 *               stage:
 *                 type: string
 *                 example: "Not qualified"
 *                 description: The stage of the lead in the sales process.
 *               source:
 *                 type: string
 *                 example: "Unpaid"
 *                 description: The source of the lead.
 *               assigned_to:
 *                 type: string
 *                 example: "Unassigned"
 *                 description: The person or team assigned to this lead.
 *               status:
 *                 type: string
 *                 example: "Incomplete form"
 *                 description: The current status of the lead.
 *               remarks:
 *                 type: string
 *                 example: "No Remarks"
 *                 description: Additional remarks about the lead.
 *               isAssigned:
 *                 type: boolean
 *                 example: false
 *                 description: Whether the lead has been assigned.
 *               followUp:
 *                 type: object
 *                 properties:
 *                   lastCallDate:
 *                     type: string
 *                     format: date-time
 *                     example: null
 *                     description: The date of the last call.
 *                   lastCallStatus:
 *                     type: string
 *                     example: "Pending"
 *                     description: The status of the last call.
 *                   nextCallScheduled:
 *                     type: string
 *                     format: date-time
 *                     example: null
 *                     description: The date and time for the next scheduled call.
 *     responses:
 *       200:
 *         description: Lead created successfully
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
 *                   description: The saved lead object.
 *                   properties:
 *                     leadId:
 *                       type: string
 *                       example: "a5b7c9d8-e9f0-1234-5678-9abc0d123456"
 *                       description: The unique identifier for the lead.
 *                     platform:
 *                       type: string
 *                       example: "Facebook"
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     full_name:
 *                       type: string
 *                       example: "John Doe"
 *                     campaign_name:
 *                       type: string
 *                       example: "Summer Sale"
 *                     ad_name:
 *                       type: string
 *                       example: "Ad123"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-07-26T10:00:00Z"
 *                     stage:
 *                       type: string
 *                       example: "Not qualified"
 *                     source:
 *                       type: string
 *                       example: "Unpaid"
 *                     assigned_to:
 *                       type: string
 *                       example: "Unassigned"
 *                     status:
 *                       type: string
 *                       example: "Incomplete form"
 *                     remarks:
 *                       type: string
 *                       example: "No Remarks"
 *                     isAssigned:
 *                       type: boolean
 *                       example: false
 *                     followUp:
 *                       type: object
 *                       properties:
 *                         lastCallDate:
 *                           type: string
 *                           format: date-time
 *                           example: null
 *                         lastCallStatus:
 *                           type: string
 *                           example: "Pending"
 *                         nextCallScheduled:
 *                           type: string
 *                           format: date-time
 *                           example: null
 *       400:
 *         description: Bad request due to invalid or missing input data
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
 *                   example: "Invalid input data. Please check your request."
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
  EXCEL_ROUTES.CREATE_SINGLE_LEAD,
  verifyToken,
  createLead,
  successResponse
);

/**
 * @swagger
 * /crm/retrieve-all-leads:
 *   get:
 *     summary: Retrieve all leads
 *     description: Retrieve all leads from the database with filtering, sorting, and pagination options.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering leads (inclusive).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering leads (inclusive).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status of the lead.
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Source of the lead.
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Assignment status of the lead.
 *         example: "assigned, unassigned, or empty"
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort leads by.
 *         example: "timestamp"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending).
 *         example: "desc"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination.
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of leads per page.
 *         example: 10
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: projectId.
 *         example: 68b82a5f-12b7-4ab8-9ff2-77a688066180
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     leads:
 *                       type: array
 *                       description: Array of lead objects.
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Unique identifier of the lead.
 *                             example: "609ba8d5e4b043004f23a6f1"
 *                           platform:
 *                             type: string
 *                             description: Platform where the lead originated.
 *                             example: "fb"
 *                           phone_number:
 *                             type: string
 *                             description: Phone number of the lead.
 *                             example: "+1234567890"
 *                           full_name:
 *                             type: string
 *                             description: Full name of the lead.
 *                             example: "John Doe"
 *                           campaign_name:
 *                             type: string
 *                             description: Name of the campaign related to the lead.
 *                             example: "New Leads campaign – Couples"
 *                           ad_name:
 *                             type: string
 *                             description: Name of the ad related to the lead.
 *                             example: "New Leads ad"
 *                           timestamp:
 *                             type: string
 *                             description: Timestamp when the lead was created.
 *                             example: "2024-05-22T09:41:27.000Z"
 *                           stage:
 *                             type: string
 *                             enum: ["qualified", "not qualified"]
 *                             description: Stage of the lead.
 *                             example: "not qualified"
 *                           source:
 *                             type: string
 *                             enum: ["paid", "unpaid"]
 *                             description: Source of the lead.
 *                             example: "paid"
 *                           assigned_to:
 *                             type: string
 *                             enum: ["unassigned", "assigned"]
 *                             description: Assignment status of the lead.
 *                             example: "unassigned"
 *                           status:
 *                             type: string
 *                             enum: ["completed form", "incomplete form"]
 *                             description: Status of the lead.
 *                             example: "incomplete form"
 *                     totalLeads:
 *                       type: integer
 *                       description: Total number of leads matching the filter criteria.
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number.
 *                       example: 1
 *       404:
 *         description: Leads not found
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
 *                   example: "Leads not found"
 */

router.get(
  LEADS_ROUTES.RETRIEVE_ALL_LEADS,
  verifyToken,
  getAllLeads,
  successResponse
);

/**
 * @swagger
 * /crm/get-lead-by-leadId/{leadId}:
 *   get:
 *     summary: Get lead by ID
 *     description: Retrieve detailed information about a lead by its ID within a specific project and organization.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the lead to retrieve.
 *         example: "ebf0d1f2-3d77-42dd-a6c4-fa370e03df76"
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization containing the lead.
 *         example: "b06fd574-ad74-4c70-b098-2f0f186483e2"
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project containing the lead.
 *         example: "68b82a5f-12b7-4ab8-9ff2-77a688066180"
 *     responses:
 *       200:
 *         description: Lead details retrieved successfully
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
 *                   description: Lead object.
 *                   properties:
 *                     leadId:
 *                       type: string
 *                       description: Unique identifier of the lead.
 *                       example: "ebf0d1f2-3d77-42dd-a6c4-fa370e03df76"
 *                     phone_number:
 *                       type: string
 *                       description: Phone number of the lead.
 *                       example: "+919353110500"
 *                     ad_name:
 *                       type: string
 *                       description: Name of the ad related to the lead.
 *                       example: "New Leads ad"
 *                     assigned_to:
 *                       type: string
 *                       description: ID of the user to whom the lead is assigned.
 *                       example: "user123"
 *                     assigned_to_name:
 *                       type: string
 *                       description: Full name of the user to whom the lead is assigned.
 *                       example: "John Doe"
 *                     followUp:
 *                       type: object
 *                       description: Follow-up details for the lead.
 *                       properties:
 *                         lastCallDate:
 *                           type: string
 *                           format: date-time
 *                           description: Date of the last call.
 *                           example: "2024-07-04T07:08:45.627Z"
 *                         lastCallStatus:
 *                           type: string
 *                           description: Status of the last call.
 *                           example: "Completed"
 *                         nextCallScheduled:
 *                           type: string
 *                           format: date-time
 *                           description: Date when the next call is scheduled.
 *                           example: "2024-07-10T07:08:45.627Z"
 *                     followUpHistory:
 *                       type: array
 *                       description: Array of follow-up history entries.
 *                       items:
 *                         type: object
 *                         properties:
 *                           lastCallDate:
 *                             type: string
 *                             format: date-time
 *                             description: Date of the last call.
 *                             example: "2024-07-04T07:08:45.627Z"
 *                           lastCallStatus:
 *                             type: string
 *                             description: Status of the last call.
 *                             example: "Completed"
 *                           nextCallScheduled:
 *                             type: string
 *                             format: date-time
 *                             description: Date when the next call is scheduled.
 *                             example: "2024-07-10T07:08:45.627Z"
 *                     assignments:
 *                       type: array
 *                       description: Array of assignment objects.
 *                       items:
 *                         type: object
 *                         properties:
 *                           assigned_by:
 *                             type: string
 *                             description: ID of the user who assigned the lead.
 *                             example: "user456"
 *                           assigned_by_name:
 *                             type: string
 *                             description: Full name of the user who assigned the lead.
 *                             example: "Jane Smith"
 *                           assigned_date:
 *                             type: string
 *                             format: date-time
 *                             description: Date of assignment.
 *                             example: "2024-07-04T07:08:45.627Z"
 *       404:
 *         description: Lead not found
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
 *                   example: "Lead not found"
 */

router.get(
  LEADS_ROUTES.RETRIEVE_LEAD_BY_USING_ID,
  verifyToken,
  getLeadById,
  successResponse
);

/**
 * @swagger
 * /crm/{projectId}/{leadId}/update-lead-status:
 *   put:
 *     summary: Update Lead Status
 *     description: Updates the status of a lead, including assignment details.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project containing the lead.
 *         example: "68b82a5f-12b7-4ab8-9ff2-77a688066180"
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lead to update.
 *         example: "ebf0d1f2-3d77-42dd-a6c4-fa370e03df76"
 *     requestBody:
 *       description: Details to update the lead status.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: User ID to whom the lead is assigned.
 *                 example: "38719252-bcb6-4a2e-8de7-b7aab9307156"
 *               stage:
 *                 type: string
 *                 description: Current stage of the lead.
 *                 example: "Not qualified"
 *               lastCallRemarks:
 *                 type: string
 *                 description: Remarks from the last call.
 *                 example: "High priority lead"
 *               assignedBy:
 *                 type: string
 *                 description: User ID of the person assigning the lead.
 *                 example: "ecd1f041-742e-446a-8617-55060cef2545"
 *               userId:
 *                 type: string
 *                 description: User ID of the current user.
 *                 example: "5f4e49f4-7a1d-4a44-8d32-4458e9a2e876"
 *     responses:
 *       200:
 *         description: Lead status updated successfully.
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
 *                   description: Updated lead object.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the lead.
 *                       example: "88f51423-6bbb-431b-90f5-fdab388032bd"
 *                     assigned_to:
 *                       type: string
 *                       description: User ID to whom the lead is assigned.
 *                       example: "38719252-bcb6-4a2e-8de7-b7aab9307156"
 *                     stage:
 *                       type: string
 *                       description: Current stage of the lead.
 *                       example: "Not qualified"
 *                     lastCallRemarks:
 *                       type: string
 *                       description: Remarks from the last call.
 *                       example: "High priority lead"
 *                     assignments:
 *                       type: array
 *                       description: Array of assignment objects.
 *                       items:
 *                         type: object
 *                         properties:
 *                           assigned_by:
 *                             type: string
 *                             description: User ID of the person who assigned the lead.
 *                             example: "ecd1f041-742e-446a-8617-55060cef2545"
 *                           assigned_to:
 *                             type: string
 *                             description: User ID to whom the lead is assigned.
 *                             example: "38719252-bcb6-4a2e-8de7-b7aab9307156"
 *                           assigned_date:
 *                             type: string
 *                             description: Date of assignment.
 *                             example: "2024-07-25T13:47:21.567Z"
 *       400:
 *         description: Bad request, missing required fields.
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
 *                   example: "Lead ID is required."
 *       404:
 *         description: Lead not found.
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
 *                   example: "Lead not found."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.put(
  LEADS_ROUTES.UPDATE_LEAD_STATUS_BY_LEAD_ID,
  verifyToken,
  updateLeadStatus,
  successResponse
);

/**
 * @swagger
 * /crm/delete-lead-by-leadId/{projectId}/{leadId}:
 *   delete:
 *     summary: Delete Lead
 *     description: Deletes a lead by its ID within a specific project.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Unique identifier of the project containing the lead.
 *         schema:
 *           type: string
 *           example: "68b82a5f-12b7-4ab8-9ff2-77a688066180"
 *       - name: leadId
 *         in: path
 *         required: true
 *         description: Unique identifier of the lead to be deleted.
 *         schema:
 *           type: string
 *           example: "88f51423-6bbb-431b-90f5-fdab388032bd"
 *     responses:
 *       200:
 *         description: Lead deleted successfully.
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
 *                   description: Details of the deleted lead.
 *                   properties:
 *                     leadId:
 *                       type: string
 *                       description: Unique identifier of the deleted lead.
 *                       example: "88f51423-6bbb-431b-90f5-fdab388032bd"
 *                 responseMessage:
 *                   type: string
 *                   example: "Lead deleted successfully."
 *       400:
 *         description: Bad request, missing lead ID.
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
 *                   example: "Lead ID is required."
 *       404:
 *         description: Lead not found.
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
 *                   example: "Lead not found."
 */

router.delete(
  LEADS_ROUTES.DELETE_LEAD_BY_LEAD_ID,
  verifyToken,
  deleteLead,
  successResponse
);

/**
 * @swagger
 * /crm/get-charts-for-leads:
 *   get:
 *     summary: Get charts for leads
 *     description: Retrieve charts data for leads.
 *     tags:
 *       - Leads
 *     responses:
 *       200:
 *         description: Charts data retrieved successfully
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
 *                     chart1:
 *                       type: object
 *                       description: Chart 1 data
 *                       properties:
 *                         label:
 *                           type: string
 *                           description: Label for the chart
 *                           example: "Leads by Source"
 *                         values:
 *                           type: array
 *                           description: Values for the chart
 *                           items:
 *                             type: object
 *                             properties:
 *                               source:
 *                                 type: string
 *                                 description: Source of the leads
 *                                 example: "Facebook"
 *                               count:
 *                                 type: number
 *                                 description: Number of leads from the source
 *                                 example: 10
 *                         image:
 *                           type: string
 *                           description: Base64 encoded image of the chart
 *                           example: "iVBORw0KGgoAAAANSUhEUgAAA..."
 *                     chart2:
 *                       type: object
 *                       description: Chart 2 data
 *                       properties:
 *                         label:
 *                           type: string
 *                           description: Label for the chart
 *                           example: "Leads by Status"
 *                         values:
 *                           type: array
 *                           description: Values for the chart
 *                           items:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                                 description: Status of the leads
 *                                 example: "Complete"
 *                               count:
 *                                 type: number
 *                                 description: Number of leads with the status
 *                                 example: 5
 *                         image:
 *                           type: string
 *                           description: Base64 encoded image of the chart
 *                           example: "iVBORw0KGgoAAAANSUhEUgAAA..."
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
 *                   example: "Internal server error"
 */

// router.get(
//   LEADS_ROUTES.GET_CHARTS_FOR_LEADS,
//   verifyToken,
//   getLeadCharts,
//   successResponse
// );

/**
 * @swagger
 * /crm/save-contact-details:
 *   post:
 *     summary: Save contact details
 *     description: Save contact details to the database and append the data to a Google Sheet.
 *     tags:
 *       - Contacts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the contact.
 *                 example: "John Doe"
 *               mobileNumber:
 *                 type: number
 *                 description: Mobile number of the contact.
 *                 example: 1234567890
 *               emailId:
 *                 type: string
 *                 description: Email ID of the contact.
 *                 example: "john.doe@example.com"
 *               message:
 *                 type: string
 *                 description: Message from the contact.
 *                 example: "I am interested in your services."
 *     responses:
 *       201:
 *         description: Contact details saved successfully.
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
 *                   example: "Contact details saved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the contact.
 *                       example: "60d5f7f8f6e8b40f9c9e75c1"
 *                     name:
 *                       type: string
 *                       description: Name of the contact.
 *                       example: "John Doe"
 *                     mobileNumber:
 *                       type: number
 *                       description: Mobile number of the contact.
 *                       example: 1234567890
 *                     emailId:
 *                       type: string
 *                       description: Email ID of the contact.
 *                       example: "john.doe@example.com"
 *                     message:
 *                       type: string
 *                       description: Message from the contact.
 *                       example: "I am interested in your services."
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing required inputs."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error."
 */

router.post(
  GOOGLE_SHEETS_API.SAVE_CONTACT_DETAILS,
  saveContactDetails,
  successResponse
);

/**
 * @swagger
 * /crm/save-agent-details:
 *   post:
 *     summary: Save contact details
 *     description: Save contact details to the database and append the data to a Google Sheet.
 *     tags:
 *       - Contacts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the contact.
 *                 example: "John Doe"
 *               mobileNumber:
 *                 type: number
 *                 description: Mobile number of the contact.
 *                 example: 1234567890
 *               emailId:
 *                 type: string
 *                 description: Email ID of the contact.
 *                 example: "john.doe@example.com"
 *               message:
 *                 type: string
 *                 description: Message from the contact.
 *                 example: "I am interested in your services."
 *     responses:
 *       201:
 *         description: Contact details saved successfully.
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
 *                   example: "Contact details saved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the contact.
 *                       example: "60d5f7f8f6e8b40f9c9e75c1"
 *                     name:
 *                       type: string
 *                       description: Name of the contact.
 *                       example: "John Doe"
 *                     mobileNumber:
 *                       type: number
 *                       description: Mobile number of the contact.
 *                       example: 1234567890
 *                     emailId:
 *                       type: string
 *                       description: Email ID of the contact.
 *                       example: "john.doe@example.com"
 *                     message:
 *                       type: string
 *                       description: Message from the contact.
 *                       example: "I am interested in your services."
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing required inputs."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error."
 */

router.post(
  GOOGLE_SHEETS_API.SAVE_AGENT_DETAILS,
  saveAgentDetails,
  successResponse
);

/**
 * @swagger
 * /crm/assign-lead:
 *   post:
 *     summary: Assign a lead to a user
 *     description: Assign a lead to a user and store the details in the database.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: leadId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the lead to be assigned.
 *         example: "1f2-3d77-42dd-a6c4-fa370e03df76"
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to assign the lead to.
 *         example: "252-bcb6-4a2e-8de7-b7aab9307156"
 *       - in: query
 *         name: remarks
 *         schema:
 *           type: string
 *         description: Remarks about the assignment.
 *         example: "High priority lead"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who is assigning the lead (taken from verified token).
 *                 example: "609ba8d5e4b043004f23a6f3"
 *     responses:
 *       200:
 *         description: Lead assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Lead object.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the lead.
 *                       example: "609ba8d5e4b043004f23a6f1"
 *                     platform:
 *                       type: string
 *                       description: Platform where the lead originated.
 *                       example: "fb"
 *                     phone_number:
 *                       type: string
 *                       description: Phone number of the lead.
 *                       example: "+1234567890"
 *                     full_name:
 *                       type: string
 *                       description: Full name of the lead.
 *                       example: "John Doe"
 *                     campaign_name:
 *                       type: string
 *                       description: Name of the campaign related to the lead.
 *                       example: "New Leads campaign – Couples"
 *                     ad_name:
 *                       type: string
 *                       description: Name of the ad related to the lead.
 *                       example: "New Leads ad"
 *                     timestamp:
 *                       type: string
 *                       description: Timestamp when the lead was created.
 *                       example: "2024-05-22T09:41:27.000Z"
 *                     stage:
 *                       type: string
 *                       enum: ["Qualified", "Not qualified", "Unread", "Intake", "Converted", "Lost"]
 *                       description: Stage of the lead.
 *                       example: "Not qualified"
 *                     source:
 *                       type: string
 *                       enum: ["Paid", "Unpaid"]
 *                       description: Source of the lead.
 *                       example: "paid"
 *                     assigned_to:
 *                       type: string
 *                       description: Current assignment status of the lead.
 *                       example: "Assigned"
 *                     status:
 *                       type: string
 *                       enum: ["completed form", "Incomplete form"]
 *                       description: Status of the lead.
 *                       example: "Incomplete form"
 *                     remarks:
 *                       type: string
 *                       description: Remarks about the lead.
 *                       example: "High priority lead"
 *                     assignments:
 *                       type: array
 *                       description: Array of assignment objects.
 *                       items:
 *                         type: object
 *                         properties:
 *                           assigned_by:
 *                             type: string
 *                             description: ID of the user who assigned the lead.
 *                             example: "609ba8d5e4b043004f23a6f3"
 *                           assigned_to:
 *                             type: string
 *                             description: ID of the user to whom the lead is assigned.
 *                             example: "609ba8d5e4b043004f23a6f2"
 *                           assigned_date:
 *                             type: string
 *                             description: Date of assignment.
 *                             example: "2024-07-01T12:34:56.000Z"
 *       404:
 *         description: Lead or user not found
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
 *                   example: "Lead or user not found"
 */

router.post(LEADS_ROUTES.ASSIGN_LEAD, assignLead, successResponse);

/**
 * @swagger
 * /crm/{projectId}/{leadId}/follow-up:
 *   put:
 *     summary: Update Lead Follow-Up Details
 *     description: Updates follow-up details for a specific lead within a specified project.
 *     tags:
 *       - Leads
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project containing the lead.
 *         example: "68b82a5f-12b7-4ab8-9ff2-77a688066180"
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lead to update follow-up details for.
 *         example: "ebf0d1f2-3d77-42dd-a6c4-fa370e03df76"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastCallDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-25T14:30:00Z"
 *                 description: The date of the last call.
 *               lastCallStatus:
 *                 type: string
 *                 enum: ["Completed", "Pending", "Failed"]
 *                 example: "Completed"
 *                 description: The status of the last call.
 *               nextCallScheduled:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-01T10:00:00Z"
 *                 description: The date when the next call is scheduled.
 *               organizationId:
 *                 type: string
 *                 example: "b06fd574-ad74-4c70-b098-2f0f186483e2"
 *                 description: The ID of the organization.
 *     responses:
 *       200:
 *         description: Follow-up details updated successfully
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
 *                     leadId:
 *                       type: string
 *                       example: "ebf0d1f2-3d77-42dd-a6c4-fa370e03df76"
 *                       description: The ID of the lead whose follow-up details were updated.
 *                     followUp:
 *                       type: object
 *                       properties:
 *                         lastCallDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-07-25T14:30:00Z"
 *                         lastCallStatus:
 *                           type: string
 *                           enum: ["Completed", "Pending", "Failed"]
 *                           example: "Completed"
 *                         nextCallScheduled:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-01T10:00:00Z"
 *                       description: The updated follow-up details for the lead.
 *                 responseMessage:
 *                   type: string
 *                   example: "Follow-up details updated successfully."
 *                   description: A message indicating the outcome of the operation.
 *       400:
 *         description: Bad request, invalid follow-up details
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
 *                   example: "Invalid follow-up details."
 *       404:
 *         description: Lead not found
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
 *                   example: "Lead not found."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.put(LEADS_ROUTES.LEAD_FOLLOW_UP, leadFollowUp, successResponse);

/**
 * @swagger
 * components:
 *   schemas:
 *     Lead:
 *       type: object
 *       required:
 *         - leadId
 *         - platform
 *         - phone_number
 *         - full_name
 *         - campaign_name
 *         - ad_name
 *         - stage
 *         - source
 *         - status
 *       properties:
 *         leadId:
 *           type: string
 *           description: Unique identifier of the lead.
 *           example: "lead123"
 *         platform:
 *           type: string
 *           description: Platform where the lead was generated.
 *           example: "Facebook"
 *         phone_number:
 *           type: string
 *           description: Phone number of the lead.
 *           example: "+1234567890"
 *         full_name:
 *           type: string
 *           description: Full name of the lead.
 *           example: "John Doe"
 *         campaign_name:
 *           type: string
 *           description: Name of the campaign associated with the lead.
 *           example: "Summer Sale 2024"
 *         ad_name:
 *           type: string
 *           description: Name of the ad that generated the lead.
 *           example: "Special Offer Ad"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lead was captured.
 *           example: "2024-07-15T12:00:00.000Z"
 *         stage:
 *           type: string
 *           enum:
 *             - Qualified
 *             - Not qualified
 *             - Unread
 *             - Intake
 *             - Converted
 *             - Lost
 *           description: Current stage of the lead.
 *           example: "Not qualified"
 *         source:
 *           type: string
 *           enum:
 *             - Paid
 *             - Unpaid
 *           description: Source of the lead.
 *           example: "Paid"
 *         assigned_to:
 *           type: string
 *           description: User to whom the lead is currently assigned.
 *           example: "user123"
 *         status:
 *           type: string
 *           enum:
 *             - completed form
 *             - Incomplete form
 *           description: Status of the lead form.
 *           example: "Incomplete form"
 *         remarks:
 *           type: string
 *           description: Additional remarks or notes about the lead.
 *           example: "Interested in upgraded plan."
 *         assignments:
 *           type: array
 *           description: List of assignments for the lead.
 *           items:
 *             type: object
 *             properties:
 *               assigned_by:
 *                 type: string
 *                 description: User who assigned the lead.
 *                 example: "manager123"
 *               assigned_to:
 *                 type: string
 *                 description: User to whom the lead is assigned.
 *                 example: "salesperson123"
 *               assigned_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the lead was assigned.
 *                 example: "2024-07-15T12:00:00.000Z"
 *       example:
 *         leadId: "lead123"
 *         platform: "Facebook"
 *         phone_number: "+1234567890"
 *         full_name: "John Doe"
 *         campaign_name: "Summer Sale 2024"
 *         ad_name: "Special Offer Ad"
 *         timestamp: "2024-07-15T12:00:00.000Z"
 *         stage: "Not qualified"
 *         source: "Paid"
 *         assigned_to: "Unassigned"
 *         status: "Incomplete form"
 *         remarks: "Interested in upgraded plan."
 *         assignments:
 *           - assigned_by: "manager123"
 *             assigned_to: "salesperson123"
 *             assigned_date: "2024-07-15T12:00:00.000Z"
 */

export default router;
