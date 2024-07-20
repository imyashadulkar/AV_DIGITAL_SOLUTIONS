import express from "express";
import { upload } from "../middleware/multer.js";

import {
  assignLead,
  extractDataFromExcel,
  getAllLeads,
  getLeadById,
  saveAgentDetails,
  saveContactDetails,
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
 * /crm/get-data-from-excel:
 *   post:
 *     summary: Extract data from Excel file and save to database
 *     description: Extracts data from an uploaded Excel file, processes it, and saves it to the database.
 *     tags:
 *       - Data Extraction
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
 *         description: Missing required inputs (Excel file)
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
 *                   example: "Missing required inputs. Please upload an Excel file."
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
 *         example: "Unassigned"
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
 *                             enum: ["qualified", "Not qualified"]
 *                             description: Stage of the lead.
 *                             example: "Not qualified"
 *                           source:
 *                             type: string
 *                             enum: ["paid", "unpaid"]
 *                             description: Source of the lead.
 *                             example: "paid"
 *                           assigned_to:
 *                             type: string
 *                             enum: ["Unassigned", "Assigned"]
 *                             description: Assignment status of the lead.
 *                             example: "Unassigned"
 *                           status:
 *                             type: string
 *                             enum: ["completed form", "Incomplete form"]
 *                             description: Status of the lead.
 *                             example: "Incomplete form"
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
 *     description: Retrieve detailed information about a lead by its ID.
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
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the lead.
 *                       example: "668647ead8f37a9c6caba9e1"
 *                     phone_number:
 *                       type: string
 *                       description: Phone number of the lead.
 *                       example: "p:+919353110500"
 *                     ad_name:
 *                       type: string
 *                       description: Name of the ad related to the lead.
 *                       example: "New Leads ad"
 *                     assigned_to:
 *                       type: string
 *                       description: Full name of the user to whom the lead is assigned.
 *                       example: "John Doe"
 *                     assignments:
 *                       type: array
 *                       description: Array of assignment objects.
 *                       items:
 *                         type: object
 *                         properties:
 *                           assigned_by:
 *                             type: string
 *                             description: Full name of the user who assigned the lead.
 *                             example: "Jane Smith"
 *                           assigned_to:
 *                             type: string
 *                             description: Full name of the user to whom the lead is assigned.
 *                             example: "John Doe"
 *                           assigned_date:
 *                             type: string
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
