import xlsx from "xlsx";
import { Lead, Contact } from "../models/index.js";
import { CONST_STRINGS } from "../helpers/constants.js";
import { stripPrefix, stripValuePrefix } from "../helpers/apiHelper.js";
import { google } from "googleapis";
import sendEmail from "../middleware/sendemail.js";

const sheets = google.sheets("v4");
import { ENV_VAR } from "../helpers/env.js";

// import { createBarChart } from "../helpers/chartHelper.js";

export const extractDataFromExcel = async (req, res, next) => {
  try {
    req.meta = { endpoint: "extractDataFromExcel" };

    if (!req.files.excelFile) {
      throw new Error("Missing required inputs");
    }

    const filePath = req.files.excelFile.tempFilePath;
    console.log("File path:", filePath);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log("Extracted JSON data:", jsonData);

    // Prepare JSON data for database insertion
    const leadsToSave = jsonData.map((leadData) => {
      return {
        platform: leadData.platform,
        phone_number: leadData.phone_number,
        full_name: leadData.full_name,
        campaign_name: leadData.campaign_name,
        ad_name: leadData.ad_name,
        timestamp: new Date(leadData.timestamp || Date.now()),
        stage: leadData.stage || "Not qualified",
        source: leadData.source || "paid",
        assigned_to: leadData.assigned_to || "Unassigned",
        status: leadData.status || "incomplete form",
      };
    });

    // Insert or update leads ensuring unique id (if you have an id field)
    const bulkOptions = leadsToSave.map((lead) => ({
      updateOne: {
        filter: { phone_number: lead.phone_number }, // Use phone_number as the unique identifier
        update: {
          $set: lead, // Only update the fields specified in lead
        },
        upsert: true, // If lead.id doesn't exist, insert it
      },
    }));

    const result = await Lead.bulkWrite(bulkOptions, { ordered: false });

    console.log("Insert result:", result);

    req.data = {
      statuscode: 200,
      responseData: result,
      responseMessage: "Data saved successfully",
    };

    next();
  } catch (err) {
    console.error("Error in extractDataFromExcel:", err);
    req.err = err;
    next(err);
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    req.data = { endpoint: "getAllLeads" };

    const leads = await Lead.find();

    req.data = {
      statuscode: 200,
      responseData: { leads },
      responseMessage: CONST_STRINGS.LEAD_RETRIEVED_SUCCESS,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const saveContactDetails = async (req, res, next) => {
  try {
    req.data = { endpoint: "saveContactDetails" };

    const { name, mobileNumber, emailId, message } = req.body;

    // Save contact details to MongoDB
    const newContact = new Contact({
      name,
      mobileNumber,
      emailId,
      message,
    });

    const savedContact = await newContact.save();

    // Prepare data for Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: "amazing-limiter-426914-q3-e20d2033e8d1.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const spreadsheetId = ENV_VAR.GOOGLE_SHEET_ID;
    const sheetName = "AV_Digital_PDF_June_2024"; // Change if you have a different sheet name

    const sheetsApi = google.sheets({ version: "v4", auth: client });

    const values = [
      [name, mobileNumber, emailId, message, new Date().toISOString()],
    ];

    const resource = {
      values,
    };

    sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: "RAW",
      resource,
    });

    const emailData = {
      to: "hey@avdigitalsolution.in",
      subject: "Hey !! yash, here's a new registration",
      body: {
        name: "I'm Excel Here's a new update for you",
        link: "https://docs.google.com/spreadsheets/d/1bhfPogIEFQA94lUAwI-u9TUsTJ5xjvQ6pDFRGKJ3GD0/edit?pli=1&gid=0#gid=0",
        intro: `Here is the new query from user Mobile Number: ${savedContact.mobileNumber}`,
        outro: "Thank you , Yash",
      },
    };

    sendEmail(emailData);

    req.data = {
      statuscode: 201,
      responseMessage: CONST_STRINGS.CONTACT_SAVED_SUCCESS,
      responseData: {
        savedContact,
      },
    };

    next();
  } catch (err) {
    console.error("Error in saveContactDetails:", err);
    req.err = err;
    next(err);
  }
};

export const saveAgentDetails = async (req, res, next) => {
  try {
    req.data = { endpoint: "saveContactDetails" };

    const { name, mobileNumber, emailId, message } = req.body;

    // Save contact details to MongoDB
    const newContact = new Contact({
      name,
      mobileNumber,
      emailId,
      message,
    });

    const savedContact = await newContact.save();

    // Prepare data for Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: "amazing-limiter-426914-q3-e20d2033e8d1.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const spreadsheetId = ENV_VAR.GOOGLE_SHEET_ID;
    const sheetName = "AV_Digital_PDF_AGENT_June_2024"; // Change if you have a different sheet name

    const sheetsApi = google.sheets({ version: "v4", auth: client });

    const values = [
      [name, mobileNumber, emailId, message, new Date().toISOString()],
    ];

    const resource = {
      values,
    };

    sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: "RAW",
      resource,
    });

    const emailData = {
      to: emailId,
      subject: "Thank you Agents for registering with us !!",
      body: {
        name: "AV Digital Solutions",
        intro:
          "Greetings from AV Digital Solutions, Thank you for showing Interest in AV Digital Solutions.",
        outro: "Thank you , Regards AV Digital Solutions",
      },
    };

    sendEmail(emailData);

    req.data = {
      statuscode: 201,
      responseMessage: CONST_STRINGS.CONTACT_SAVED_SUCCESS,
      responseData: {
        savedContact,
      },
    };

    next();
  } catch (err) {
    console.error("Error in saveContactDetails:", err);
    req.err = err;
    next(err);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    req.data = { endpoint: "getLeadById" };

    const { id } = req.query;

    const lead = await Lead.findOne({ id });

    if (!lead) {
      req.data.statuscode = 404;
      req.data.responseMessage = CONST_STRINGS.LEAD_NOT_FOUND; // Adjust error message as per your constants
      return next();
    }

    req.data.statuscode = 200;
    req.data.responseData = lead;
    next();
  } catch (err) {
    console.error("Error in getLeadById:", err);
    req.err = err;
    next(err);
  }
};

// export const getLeadCharts = async (req, res, next) => {
//   try {
//     const leads = await Lead.find();
//     console.log("Leads:", leads);

//     // Initialize data for charts
//     const leadsBySource = {};
//     const leadsByStatus = {};

//     // Count leads by source and status
//     leads.forEach((lead) => {
//       const source = lead.platform;
//       const status = lead.lead_status;

//       if (leadsBySource[source]) {
//         leadsBySource[source]++;
//       } else {
//         leadsBySource[source] = 1;
//       }

//       if (leadsByStatus[status]) {
//         leadsByStatus[status]++;
//       } else {
//         leadsByStatus[status] = 1;
//       }
//     });

//     // Prepare data for chart 1 (Leads by Source)
//     const chartData1 = {
//       labels: Object.keys(leadsBySource),
//       datasets: [
//         {
//           label: "Leads by Source",
//           data: Object.values(leadsBySource),
//           backgroundColor: "rgba(75, 192, 192, 0.6)",
//         },
//       ],
//     };

//     // Prepare data for chart 2 (Leads by Status)
//     const chartData2 = {
//       labels: Object.keys(leadsByStatus),
//       datasets: [
//         {
//           label: "Leads by Status",
//           data: Object.values(leadsByStatus),
//           backgroundColor: "rgba(153, 102, 255, 0.6)",
//         },
//       ],
//     };

//     // Create charts
//     const chart1Buffer = await createBarChart(chartData1);
//     const chart2Buffer = await createBarChart(chartData2);
//     console.log("chart1Buffer:", chart1Buffer);
//     console.log("chart2Buffer:", chart2);

//     // Encode charts to base64 to include in JSON response
//     const chart1Base64 = chart1Buffer.toString('base64');
//     const chart2Base64 = chart2Buffer.toString('base64');

//     res.status(200).json({
//       success: true,
//       data: {
//         chart1: {
//           label: chartData1.datasets[0].label,
//           values: chartData1.labels.map((label, index) => ({
//             source: label,
//             count: chartData1.datasets[0].data[index],
//           })),
//           image: chart1Base64,
//         },
//         chart2: {
//           label: chartData2.datasets[0].label,
//           values: chartData2.labels.map((label, index) => ({
//             status: label,
//             count: chartData2.datasets[0].data[index],
//           })),
//           image: chart2Base64,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("Error in getLeadCharts:", err);
//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//     });
//   }
// };

// export const getLeadCharts = async (req, res, next) => {
//   try {
//     req.data = { endpoint: "getLeadCharts" };

//     const leads = await Lead.find();

//     const chartData = {
//       labels: [],
//       datasets: [
//         {
//           label: "Leads by Date",
//           data: [],
//           backgroundColor: "rgba(75, 192, 192, 0.6)",
//         },
//       ],
//     };

//     const leadsByDate = {};
//     leads.forEach((lead) => {
//       const date = new Date(lead.created_time).toISOString().split("T")[0];
//       if (leadsByDate[date]) {
//         leadsByDate[date]++;
//       } else {
//         leadsByDate[date] = 1;
//       }
//     });

//     // Populate chart data
//     Object.keys(leadsByDate).forEach((date) => {
//       chartData.labels.push(date);
//       chartData.datasets[0].data.push(leadsByDate[date]);
//     });

//     // Create bar chart
//     const barChartBuffer = await createBarChart(chartData);

//     // Create pie chart (Optional: if needed)
//     const pieChartBuffer = await createPieChart(chartData);

//     req.data.statuscode = 200;
//     req.data.responseData = { barChartBuffer, pieChartBuffer };
//     next();
//   } catch (err) {
//     console.error("Error in getLeadCharts:", err);
//     req.err = err;
//     next(err);
//   }
// };
