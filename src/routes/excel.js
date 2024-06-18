import express from "express";
import { upload } from "../middleware/multer.js";

import {
  extractDataFromExcel,
  getAllLeads,
  getLeadById,
  getLeadCharts,
} from "../controllers/excelapi.js";
import { EXCEL_ROUTES, LEADS_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

const router = express.Router();

/**
 * @swagger
 * crm/get-data-from-excel:
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
 *     description: Retrieve all leads from the database.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
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
 *                   type: array
 *                   description: Array of lead objects.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique identifier of the lead.
 *                         example: "609ba8d5e4b043004f23a6f1"
 *                       id:
 *                         type: string
 *                         description: ID of the lead.
 *                         example: "l:761998039379463"
 *                       ad_id:
 *                         type: string
 *                         description: ID of the ad related to the lead.
 *                         example: "ag:120208287823370438"
 *                       ad_name:
 *                         type: string
 *                         description: Name of the ad related to the lead.
 *                         example: "New Leads ad"
 *                       adset_id:
 *                         type: string
 *                         description: ID of the ad set related to the lead.
 *                         example: "as:120208287823350438"
 *                       adset_name:
 *                         type: string
 *                         description: Name of the ad set related to the lead.
 *                         example: "New Leads ad set – new video couples"
 *                       campaign_id:
 *                         type: string
 *                         description: ID of the campaign related to the lead.
 *                         example: "c:120208287823360438"
 *                       campaign_name:
 *                         type: string
 *                         description: Name of the campaign related to the lead.
 *                         example: "New Leads campaign – Couples"
 *                       created_time:
 *                         type: string
 *                         description: Timestamp when the lead was created.
 *                         example: "2024-05-22T09:41:27.000Z"
 *                       form_id:
 *                         type: string
 *                         description: ID of the form related to the lead.
 *                         example: "f:1809397289547883"
 *                       form_name:
 *                         type: string
 *                         description: Name of the form related to the lead.
 *                         example: "Untitled form 01/04/2024, 21:50"
 *                       full_name:
 *                         type: string
 *                         description: Full name of the lead.
 *                         example: "John Doe"
 *                       is_organic:
 *                         type: boolean
 *                         description: Indicates if the lead is organic.
 *                         example: false
 *                       lead_status:
 *                         type: string
 *                         description: Status of the lead.
 *                         example: "complete"
 *                       phone_number:
 *                         type: string
 *                         description: Phone number of the lead.
 *                         example: "+1234567890"
 *                       platform:
 *                         type: string
 *                         description: Platform where the lead originated.
 *                         example: "fb"
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
 * /crm/retrieve-lead-by-id:
 *   get:
 *     summary: Get lead by ID
 *     description: Retrieve a lead from the database by its ID.
 *     tags:
 *       - Leads
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lead to retrieve.
 *     responses:
 *       200:
 *         description: Lead retrieved successfully
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
 *                     _id:
 *                       type: string
 *                       description: Unique identifier of the lead.
 *                       example: "609ba8d5e4b043004f23a6f1"
 *                     id:
 *                       type: string
 *                       description: ID of the lead.
 *                       example: "l:761998039379463"
 *                     ad_id:
 *                       type: string
 *                       description: ID of the ad related to the lead.
 *                       example: "ag:120208287823370438"
 *                     ad_name:
 *                       type: string
 *                       description: Name of the ad related to the lead.
 *                       example: "New Leads ad"
 *                     adset_id:
 *                       type: string
 *                       description: ID of the ad set related to the lead.
 *                       example: "as:120208287823350438"
 *                     adset_name:
 *                       type: string
 *                       description: Name of the ad set related to the lead.
 *                       example: "New Leads ad set – new video couples"
 *                     campaign_id:
 *                       type: string
 *                       description: ID of the campaign related to the lead.
 *                       example: "c:120208287823360438"
 *                     campaign_name:
 *                       type: string
 *                       description: Name of the campaign related to the lead.
 *                       example: "New Leads campaign – Couples"
 *                     created_time:
 *                       type: string
 *                       description: Timestamp when the lead was created.
 *                       example: "2024-05-22T09:41:27.000Z"
 *                     form_id:
 *                       type: string
 *                       description: ID of the form related to the lead.
 *                       example: "f:1809397289547883"
 *                     form_name:
 *                       type: string
 *                       description: Name of the form related to the lead.
 *                       example: "Untitled form 01/04/2024, 21:50"
 *                     full_name:
 *                       type: string
 *                       description: Full name of the lead.
 *                       example: "समीउल्लाह"
 *                     is_organic:
 *                       type: boolean
 *                       description: Indicates if the lead is organic.
 *                       example: false
 *                     lead_status:
 *                       type: string
 *                       description: Status of the lead.
 *                       example: "complete"
 *                     phone_number:
 *                       type: string
 *                       description: Phone number of the lead.
 *                       example: "p:+919353110500"
 *                     platform:
 *                       type: string
 *                       description: Platform where the lead originated.
 *                       example: "fb"
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

router.get(
  LEADS_ROUTES.GET_CHARTS_FOR_LEADS,
  verifyToken,
  getLeadCharts,
  successResponse
);

export default router;
