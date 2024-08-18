import cron from "node-cron";
import axios from "axios";
import { config } from "dotenv";
import { Lead } from "../models/Lead.js";
import { v4 as uuidv4 } from "uuid";

config();

const ACCESS_TOKEN = process.env.access_token;
const PAGE_ID = process.env.pageId;
const API_URL = `https://graph.facebook.com/v16.0/${PAGE_ID}/leadgen_forms?access_token=${ACCESS_TOKEN}`;

async function fetchLeads() {
    try {
      // Get form IDs for the page
      const formsResponse = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/leadgen_forms?access_token=${ACCESS_TOKEN}`);
      const leadForms = formsResponse.data.data;
      console.log('Lead Forms:', leadForms);
  
      for (const form of leadForms) {
        const formId = form.id;
        const API_URL = `https://graph.facebook.com/v20.0/${formId}/leads?access_token=${ACCESS_TOKEN}`;
        let allLeads = [];
  
        // Fetch initial leads data
        let response = await axios.get(API_URL);
        let leadsData = response.data.data;
        allLeads.push(...leadsData);
  
        console.log('Initial Leads Data:', leadsData);
  
        // Fetch all pages of leads
        while (response.data.paging && response.data.paging.next) {
          response = await axios.get(response.data.paging.next);
          leadsData = response.data.data;
          allLeads.push(...leadsData);
        }
  
        console.log(`Fetching leads for formId: ${formId}`);
        const organizationId = '74a40d19-a238-4586-b871-e818a4ea7044'; // Replace with actual organizationId
        const projectId = '733c2ee4-41a3-41c7-8fea-86c4e9ce1ed5'; // Replace with actual projectId
  
        // Fetch existing leads in bulk
        const existingLeads = await Lead.find({
          organizationId,
          "projects.projectId": projectId
        }).exec();
  
        const existingLeadsMap = new Map();
        existingLeads.forEach(lead => {
          lead.projects.forEach(project => {
            project.leads.forEach(leadItem => {
              const key = `${leadItem.phone_number}-${leadItem.timestamp}`;
              existingLeadsMap.set(key, true);
            });
          });
        });
  
        // Collect campaign and ad IDs
        const campaignIds = new Set();
        const adIds = new Set();
  
        allLeads.forEach(lead => {
          if (lead.campaign_id) campaignIds.add(lead.campaign_id);
          if (lead.ad_id) adIds.add(lead.ad_id);
        });
  
        console.log('Campaign IDs:', campaignIds);
        console.log('Ad IDs:', adIds);
  
        // Fetch campaign and ad names
        const campaignPromises = Array.from(campaignIds).map(id => 
          axios.get(`https://graph.facebook.com/v20.0/${id}?fields=name&access_token=${ACCESS_TOKEN}`)
        );
  
        const adPromises = Array.from(adIds).map(id => 
          axios.get(`https://graph.facebook.com/v20.0/${id}?fields=name&access_token=${ACCESS_TOKEN}`)
        );
  
        const [campaignResponses, adResponses] = await Promise.all([
          Promise.all(campaignPromises),
          Promise.all(adPromises),
        ]);
  
        const campaignsMap = new Map(campaignResponses.map(response => [response.data.id, response.data.name]));
        const adsMap = new Map(adResponses.map(response => [response.data.id, response.data.name]));
  
        console.log('Campaigns Map:', campaignsMap);
        console.log('Ads Map:', adsMap);
  
        // Prepare leads for database insertion, with a check for duplicates
        const newLeads = [];
        for (let lead of allLeads) {
          const phone_number = lead.field_data.find(field => field.name === 'phone_number').values[0];
          const timestamp = new Date(lead.created_time);
          const key = `${phone_number}-${timestamp}`;
  
          if (existingLeadsMap.has(key)) {
            console.log(`Lead with phone_number: ${phone_number} already exists, skipping...`);
            continue; // Skip to the next lead if it already exists
          }
  
          const campaign_name = campaignsMap.get(lead.campaign_id) || 'Unknown Campaign';
          const ad_name = adsMap.get(lead.ad_id) || 'Unknown Ad';
  
          const newLead = {
            leadId: uuidv4(),
            platform: 'Facebook',
            phone_number: phone_number,
            full_name: lead.field_data.find(field => field.name === 'full_name').values[0],
            campaign_name: campaign_name,
            ad_name: ad_name,
            timestamp: timestamp,
            stage: 'Not qualified',
            source: 'Facebook Ads',
            assigned_to: 'Unassigned',
            status: 'Completed form',
            remarks: 'Imported from Facebook',
            isAssigned: false,
            followUp: {
              lastCallDate: null,
              lastCallStatus: 'Pending',
              nextCallScheduled: null,
            },
          };
  
          newLeads.push(newLead);
        }
  
        // Insert new leads into the database in bulk
        if (newLeads.length > 0) {
          let result = await Lead.findOne({ organizationId });
  
          if (!result) {
            // Create a new document if it doesn't exist
            result = new Lead({
              organizationId,
              userId: 'c60159d0-5a2b-43af-a71b-56e175ab205f', // Replace with actual userId
              projects: [{ projectId, leads: newLeads }],
            });
          } else {
            // Document found, update or create the project
            const project = result.projects.find(p => p.projectId === projectId);
  
            if (project) {
              // Project found, update the leads
              project.leads.push(...newLeads);
            } else {
              // Project not found, create a new project
              result.projects.push({
                projectId,
                leads: newLeads,
              });
            }
          }
          await result.save(); // Save the document
          console.log('Leads saved to the database:', newLeads);
        }
      }
    } catch (error) {
      console.error('Error in fetchLeads:', error);
    }
  }
  

function startLeadScheduler() {
    // Schedule the task to run after 5 minutes
    cron.schedule("*/3 * * * *", () => {
        console.log("Fetching Facebook leads...");
        fetchLeads();
    });
}

export { startLeadScheduler };
