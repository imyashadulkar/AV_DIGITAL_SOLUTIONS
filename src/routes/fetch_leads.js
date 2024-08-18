import express from "express";
import axios from "axios";
import { config } from "dotenv";
import { Lead } from "../models/Lead.js";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

config();

const router = express.Router();
const fetchLeadForms = async (req, res) => {
    const pageId = req.params.pageId; // Get pageId from request params

    try {
        const response = await axios.get(`https://graph.facebook.com/v16.0/${pageId}/leadgen_forms`, {
            params: { access_token: process.env.access_token }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching lead forms:', error.response.data);
        res.status(500).json({ message: 'Error fetching lead forms', error: error.response.data });
    }
};

// Swagger documentation for fetchLeads
/**
 * @swagger
 * /fetch/leads/{formId}:
 *   get:
 *     summary: Fetch leads by Form ID
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the form
 *     responses:
 *       '200':
 *         description: Successful response
 *       '500':
 *         description: Error fetching leads
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Fetch leads based on Form ID
const fetchLeads = async (req, res,next) => {
    const formId = req.params.formId; // Get formId from request params
    const { userId, organizationId } = req.body; // Extract from request body
    const projectId = req.params.projectId; // Get projectId from request params
    console.log('Form ID:' , req.body);

    try {
        // Set up interval to fetch leads every 30 seconds
        const interval = setInterval(async () => {
            const response = await axios.get(`https://graph.facebook.com/v16.0/${formId}/leads`, {
                params: { access_token: process.env.access_token, limit: 1000 }
            });

            // Get the latest leads
            const latestLeads = response.data.data;

            // Process each lead
            for (const lead of latestLeads) {
                // Generate a unique lead ID
                const leadId = uuidv4();

                // Prepare the lead data
                const leadData = {
                    leadId,
                    platform: 'Facebook', // Assuming the platform is Facebook
                    phone_number: lead.field_data.find(field => field.name === 'phone_number')?.values[0],
                    full_name: lead.field_data.find(field => field.name === 'full_name')?.values[0],
                    campaign_name: lead.field_data.find(field => field.name === 'campaign_name')?.values[0] || 'N/A',
                    ad_name: lead.field_data.find(field => field.name === 'ad_name')?.values[0] || 'N/A',
                    timestamp: lead.created_time,
                    // Add any other fields you want to include
                };
                console.log('Lead data:', leadData);

                // Find the project in the database
                const existingLead = await Lead.findOne({ userId, organizationId, 'projects.projectId': projectId });
                console.log('Existing lead:', existingLead);

                if (existingLead) {
                    // Push the new lead into the project's leads array
                    existingLead.projects.forEach(project => {
                        if (project.projectId === projectId) {
                            project.leads.push(leadData);
                        }
                    });
                    await existingLead.save(); // Save the updated lead document
                } else {
                    // If no existing lead document, create a new one
                    const newLead = new Lead({
                        userId,
                        organizationId,
                        projects: [{
                            projectId,
                            leads: [leadData]
                        }]
                    });
                    await newLead.save(); // Save the new lead document
                }
            }

            console.log(`${latestLeads.length} leads fetched and saved for form ${formId}`);
        }, 30000); // 30 seconds

        // Clear interval when the request ends
        req.on('close', () => {
            clearInterval(interval);
        });

        // Send initial leads response
        const response = await axios.get(`https://graph.facebook.com/v16.0/${formId}/leads`, {
            params: { access_token: process.env.access_token, limit: 100 }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching leads:', error.response.data);
        res.status(500).json({ message: 'Error fetching leads', error: error.response.data });
    }
};



// Route to fetch lead forms by page ID
router.get('/forms/:pageId',fetchLeadForms);

// Route to fetch leads by Form ID
router.get('/leads/:formId',verifyToken, fetchLeads);
// Swagger documentation for fetchLeadForms

/**
 * @swagger
 * /fetch/forms/{pageId}:
 *   get:
 *     summary: Fetch lead forms by page ID
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the page
 *     responses:
 *       '200':
 *         description: Successful response
 *       '500':
 *         description: Error fetching lead forms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */



export default router;

