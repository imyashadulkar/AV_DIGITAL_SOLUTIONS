import xlsx from "xlsx";
import { Lead, Contact, User } from "../models/index.js";
import { CONST_STRINGS } from "../helpers/constants.js";
import { google } from "googleapis";
import sendEmail from "../middleware/sendemail.js";
import { v4 as uuidv4 } from "uuid";

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

    const { userId, organizationId, projectId } = req.body;

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log("Extracted JSON data:", jsonData);

    // Prepare JSON data for database insertion
    const leadsToSave = jsonData.map((leadData) => {
      return {
        leadId: uuidv4(),
        platform: leadData.platform,
        phone_number: leadData.phone_number,
        full_name: leadData.full_name,
        campaign_name: leadData.campaign_name,
        ad_name: leadData.ad_name,
        timestamp: new Date(leadData.timestamp || Date.now()),
        stage: leadData.stage || "Not qualified",
        source: leadData.source || "Unpaid",
        assigned_to: leadData.assigned_to || "Unassigned",
        status: leadData.status || "Incomplete form",
        remarks: leadData.remarks || "No Remarks",
        isAssigned: leadData.isAssigned || false,
        followUp: {
          lastCallDate: null, // or use new Date() if you prefer
          lastCallStatus: "Pending",
          nextCallScheduled: null, // or use new Date() if you prefer
        },
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

export const createLead = async (req, res, next) => {
  try {
    req.meta = { endpoint: "createLead" };

    const {
      platform,
      phone_number,
      full_name,
      campaign_name,
      ad_name,
      stage,
      source,
      assigned_to,
      status,
      remarks,
      isAssigned,
      followUp,
    } = req.body;

    // Create a new lead object
    const newLead = new Lead({
      leadId: uuidv4(),
      platform,
      phone_number,
      full_name,
      campaign_name,
      ad_name,
      timestamp: new Date(),
      stage: stage || "Not qualified",
      source: source || "Unpaid",
      assigned_to: assigned_to || "Unassigned",
      status: status || "Incomplete form",
      remarks: remarks || "No Remarks",
      isAssigned: isAssigned || false,
      followUp: followUp || {
        lastCallDate: null,
        lastCallStatus: "Pending",
        nextCallScheduled: null,
      },
    });

    // Save the new lead
    const savedLead = await newLead.save();

    req.data = {
      statuscode: 200,
      responseData: savedLead,
      responseMessage: "Lead created successfully",
    };

    next();
  } catch (err) {
    console.error("Error in createLead:", err);
    req.err = err;
    next(err);
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    req.data = { endpoint: "getAllLeads" };

    // Extract query parameters
    const {
      startDate,
      endDate,
      status,
      source,
      assigned_to,
      sortField,
      sortOrder,
      page,
      limit,
    } = req.query;

    // Build the filter object
    const filter = {};

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (status) filter.status = status;
    if (source) filter.source = source;

    // Set filter for isAssigned based on the assigned_to parameter
    if (assigned_to === "assigned") {
      filter.isAssigned = true;
    } else if (assigned_to === "unassigned") {
      filter.isAssigned = false;
    }

    // Build the sort object
    const sort = {};
    if (sortField && sortOrder) {
      sort[sortField] = sortOrder === "desc" ? -1 : 1;
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Fetch filtered, sorted, and paginated leads
    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Fetch total number of leads matching the filter
    const totalLeads = await Lead.countDocuments(filter);

    // Fetch user details for assigned_to and each assignment's assigned_by
    const leadsWithDetails = await Promise.all(
      leads.map(async (lead) => {
        // Fetch user details for assigned_to
        const assignedToUser = lead.assigned_to
          ? await User.findOne({ userId: lead.assigned_to })
          : null;

        // Fetch user details for each assignment's assigned_by
        const assignmentsWithNames = await Promise.all(
          lead.assignments.map(async (assignment) => {
            const assignedByUser = await User.findOne({
              userId: assignment.assigned_by,
            });
            return {
              ...assignment.toObject(),
              assigned_by_name: assignedByUser
                ? assignedByUser.full_name
                : "Unknown",
              assigned_by_username: assignedByUser
                ? assignedByUser.userName
                : "Unknown",
            };
          })
        );

        return {
          ...lead.toObject(),
          assigned_to_name: assignedToUser
            ? assignedToUser.userName
            : "Unassigned",
          assigned_to_full_name: assignedToUser
            ? assignedToUser.full_name
            : "Unassigned",
          assignments: assignmentsWithNames,
        };
      })
    );

    req.data = {
      statuscode: 200,
      responseData: {
        leads: leadsWithDetails,
        totalLeads,
        totalPages: Math.ceil(totalLeads / limit),
        currentPage: parseInt(page),
      },
      responseMessage: CONST_STRINGS.LEAD_RETRIEVED_SUCCESS,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    req.data = { endpoint: "getLeadById" };

    const { leadId } = req.params;

    if (!leadId) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // Fetch the lead
    const lead = await Lead.findOne({ leadId });

    if (!lead) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    // Fetch user details for assigned_to
    const assignedToUser = lead.assigned_to
      ? await User.findOne({ userId: lead.assigned_to })
      : null;

    // Fetch user details for each assignment's assigned_by
    const assignmentsWithNames = await Promise.all(
      lead.assignments.map(async (assignment) => {
        const assignedByUser = await User.findOne({
          userId: assignment.assigned_by,
        });
        return {
          ...assignment.toObject(),
          assigned_by_name: assignedByUser
            ? assignedByUser.full_name
            : "Unknown",
          assigned_by_username: assignedByUser
            ? assignedByUser.userName
            : "Unknown",
        };
      })
    );

    const leadWithDetails = {
      ...lead.toObject(),
      assigned_to_name: assignedToUser ? assignedToUser.userName : "Unassigned",
      assigned_to_full_name: assignedToUser
        ? assignedToUser.full_name
        : "Unassigned",
      assignments: assignmentsWithNames,
    };

    req.data = {
      statuscode: 200,
      responseData: leadWithDetails,
      responseMessage: CONST_STRINGS.LEAD_RETRIEVED_SUCCESS,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const leadFollowUp = async (req, res, next) => {
  try {
    req.data = { endpoint: "leadFollowUp" };

    const { leadId } = req.params;
    const { lastCallDate, lastCallStatus, nextCallScheduled } = req.body;

    // Validate input
    if (!leadId || !lastCallDate || !lastCallStatus || !nextCallScheduled) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // Fetch the lead
    const lead = await Lead.findOne({ leadId });

    if (!lead) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    const followUpHistoryEntry = {
      lastCallDate: new Date(lastCallDate),
      lastCallStatus,
      nextCallScheduled: new Date(nextCallScheduled),
    };

    // Update the lead with follow-up details
    const updatedLead = await Lead.findOneAndUpdate(
      { leadId },
      {
        $set: {
          "followUp.lastCallDate": new Date(lastCallDate),
          "followUp.lastCallStatus": lastCallStatus,
          "followUp.nextCallScheduled": new Date(nextCallScheduled),
        },
        $push: {
          followUpHistory: followUpHistoryEntry,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedLead) {
      throw new Error(CONST_STRINGS.LEAD_UPDATE_FAILED);
    }

    req.data = {
      statuscode: 200,
      responseData: updatedLead,
      responseMessage: CONST_STRINGS.LEAD_UPDATED_SUCCESS,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    req.meta = { endpoint: "updateLeadStatus" };

    const { leadId, assignedTo, stage, lastCallRemarks, assignedBy, userId } =
      req.body;

    if (!leadId) {
      throw new Error(CONST_STRINGS.MISSING_LEAD_ID);
    }

    // Prepare update fields
    const updateFields = {};
    if (stage) {
      updateFields.stage = stage;
    }
    if (lastCallRemarks) {
      updateFields.lastCallRemarks = lastCallRemarks;
    }

    if (assignedTo) {
      // Prepare assignment data
      const assignmentData = {
        assigned_by: assignedBy || userId,
        assigned_to: assignedTo,
        assigned_date: new Date(),
      };

      // Update or add assignment
      updateFields["assignments.$[elem]"] = assignmentData;
      updateFields.assigned_to = assignedTo;
      updateFields.isAssigned = true;

      // Ensure correct array filter
      await Lead.findOneAndUpdate(
        { leadId },
        { $set: updateFields },
        {
          arrayFilters: [{ "elem.assigned_to": assignedTo }],
          new: true,
          upsert: false,
        }
      );
    } else {
      // Update document without modifying assignments
      await Lead.findOneAndUpdate(
        { leadId },
        { $set: updateFields },
        { new: true }
      );
    }

    // Fetch the updated lead
    const updatedLead = await Lead.findOne({ leadId });

    const responseMessage = CONST_STRINGS.LEAD_UPDATED_SUCCESSFULLY;
    const responseData = updatedLead;

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    req.meta = { endpoint: "deleteLead" };

    const { leadId } = req.body;

    if (!leadId) {
      throw new Error(CONST_STRINGS.MISSING_LEAD_ID);
    }

    // Find and delete the lead
    const result = await Lead.findOneAndDelete({ leadId });

    if (!result) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    const responseMessage = CONST_STRINGS.LEAD_DELETED_SUCCESSFULLY;
    const responseData = { leadId };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
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

export const assignLead = async (req, res, next) => {
  try {
    req.meta = { endpoint: "assignLead" };

    const { assignedTo, remarks, leadId } = req.query;
    const { userId } = req.body;
    console.log(req.body);

    if (!leadId || !assignedTo) {
      throw new Error("Missing required inputs");
    }

    // Fetch the lead
    const lead = await Lead.findOne({ leadId });
    if (!lead) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    // Fetch the user to whom the lead is being assigned
    const assignedToUser = await User.findOne({ userId: assignedTo });
    if (!assignedToUser) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    // Create a new assignment
    const newAssignment = {
      assigned_by: userId,
      assigned_to: assignedTo,
      assigned_date: new Date(),
    };

    // Create an assignment history entry
    const assignmentHistoryEntry = {
      assigned_by: userId,
      assigned_to: assignedTo,
      assigned_date: new Date(),
    };

    // Update the lead with the new assignment and history
    lead.assignments.push(newAssignment);
    lead.assigned_to = assignedTo;
    lead.isAssigned = true;
    lead.remarks = remarks || lead.remarks;

    // Add to assignment history
    lead.assignmentHistory.push(assignmentHistoryEntry);

    // Save the updated lead
    await lead.save();

    req.data = {
      statuscode: 200,
      responseData: lead,
      responseMessage: CONST_STRINGS.LEAD_ASSIGNED_SUCCESS,
    };
    next();
  } catch (err) {
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
