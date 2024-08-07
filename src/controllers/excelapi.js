import xlsx from "xlsx";
import { Lead, Contact, User, AuthSubUser } from "../models/index.js";
import { CONST_STRINGS } from "../helpers/constants.js";
import { google } from "googleapis";
import sendEmail from "../middleware/sendemail.js";
import { v4 as uuidv4 } from "uuid";

import { ENV_VAR } from "../helpers/env.js";

// import { createBarChart } from "../helpers/chartHelper.js";

export const extractDataFromExcel = async (req, res, next) => {
  try {
    req.meta = { endpoint: "extractDataFromExcel" };

    if (!req.files || !req.files.excelFile) {
      return res.status(400).json({
        success: false,
        error: "Missing required inputs. Please upload an Excel file.",
      });
    }

    const filePath = req.files.excelFile.tempFilePath;
    console.log("File path:", filePath);

    const { userId, organizationId } = req.body;
    const { projectId } = req.params; // Get projectId from req.params

    if (!projectId || !organizationId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Project ID, User ID, and Organization ID are required.",
      });
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log("Extracted JSON data:", jsonData);

    // Prepare JSON data for database insertion
    const leadsToSave = jsonData.map((leadData) => ({
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
        lastCallDate: null,
        lastCallStatus: "Pending",
        nextCallScheduled: null,
      },
    }));

    // Find the document by organizationId, if not found create a new document
    let result = await Lead.findOne({
      organizationId: organizationId,
    });

    if (!result) {
      // Create a new document if it doesn't exist
      result = new Lead({
        organizationId,
        userId,
        projects: [{ projectId, leads: leadsToSave }],
      });
      await result.save();
    } else {
      // Document found, update or create the project
      const project = result.projects.find((p) => p.projectId === projectId);

      if (project) {
        // Project found, update the leads
        project.leads.push(...leadsToSave);
      } else {
        // Project not found, create a new project
        result.projects.push({
          projectId,
          leads: leadsToSave,
        });
      }
      await result.save();
    }

    console.log("Insert result:", result);

    res.status(200).json({
      success: true,
      message: "Data saved successfully",
      data: {
        statuscode: 200,
        responseData: result,
        responseMessage: "Data saved successfully",
      },
    });
  } catch (err) {
    console.error("Error in extractDataFromExcel:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
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
      organizationId,
    } = req.body;

    const { projectId } = req.query; // Get organizationId and projectId from req.params

    console.log("Organization ID:", organizationId);

    if (!organizationId || !projectId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID and Project ID are required.",
      });
    }

    // Create a new lead object
    const newLead = {
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
    };

    // Find the document by organizationId and projectId, then add the new lead
    const result = await Lead.findOneAndUpdate(
      { organizationId, "projects.projectId": projectId },
      { $push: { "projects.$.leads": newLead } },
      { new: true, upsert: true } // upsert option to create the document if it does not exist
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Failed to update or create the organization or project.",
      });
    }

    console.log("Lead creation result:", result);

    req.data = {
      statuscode: 200,
      responseData: result,
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

    // Extract query parameters with default values
    const {
      startDate,
      endDate,
      status,
      source,
      assigned_to,
      sortField = "timestamp",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      projectId, // Extract projectId
    } = req.query;

    const { organizationId } = req.body;

    // Validate page and limit
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid page number." });
    }

    if (isNaN(limitNumber) || limitNumber <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid limit value." });
    }

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

    // Add organizationId and projectId filters if provided
    if (organizationId) {
      filter.organizationId = organizationId;
    }
    if (projectId) {
      filter["projects.projectId"] = projectId;
    }

    // Build the sort object
    const sort = {};
    sort[sortField] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination values
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch filtered, sorted, and paginated leads
    console.log("Filter applied:", filter);
    console.log("Sort applied:", sort);
    console.log("Skip:", skip, "Limit:", limitNumber);

    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    // Fetch total number of leads matching the filter
    const totalLeads = await Lead.countDocuments(filter);

    console.log("Leads fetched:", leads.length);
    console.log("Total leads matching filter:", totalLeads);

    // Fetch user details for assigned_to and each assignment's assigned_by
    const leadsWithDetails = await Promise.all(
      leads.map(async (lead) => {
        console.log(`Processing lead ID: ${lead._id}`);

        let assignedToUser = null;
        let assignedToName = "Unassigned";
        let assignedToFullName = "Unassigned";

        if (lead.assigned_to) {
          assignedToUser = await User.findOne({ userId: lead.assigned_to });
          if (!assignedToUser) {
            console.log(
              `No user found in User collection for ID: ${lead.assigned_to}`
            );
            assignedToUser = await AuthSubUser.findOne({
              userId: lead.assigned_to,
            });
            if (assignedToUser) {
              console.log(
                `User found in AuthSubUser collection for ID: ${lead.assigned_to}`
              );
              assignedToName = assignedToUser.subUsername || "Unassigned";
              assignedToFullName = assignedToUser.subFullname || "Unassigned";
            }
          } else {
            console.log(
              `User found in User collection for ID: ${lead.assigned_to}`
            );
            assignedToName = assignedToUser.userName || "Unassigned";
            assignedToFullName = assignedToUser.full_name || "Unassigned";
          }
        } else {
          console.log(`Assigned_to field is null for lead ID: ${lead._id}`);
        }

        console.log(
          `Lead ID: ${lead._id}, Assigned To User: ${assignedToUser}`
        );
        console.log(
          `Assigned To Name: ${assignedToName}, Assigned To Full Name: ${assignedToFullName}`
        );

        // Ensure assignments is defined and is an array
        const assignments = Array.isArray(lead.assignments)
          ? lead.assignments
          : [];

        // Fetch user details for each assignment's assigned_by from both User and AuthSubUser collections
        const assignmentsWithNames = await Promise.all(
          assignments.map(async (assignment) => {
            let assignedByUser = await User.findOne({
              userId: assignment.assigned_by,
            });
            let assignedByName = "Unknown";
            if (!assignedByUser) {
              assignedByUser = await AuthSubUser.findOne({
                userId: assignment.assigned_by,
              });
              if (assignedByUser) {
                assignedByName = assignedByUser.subUsername || "Unknown";
              }
            } else {
              assignedByName = assignedByUser.userName || "Unknown";
            }
            return {
              ...assignment.toObject(),
              assigned_by_name: assignedByName,
            };
          })
        );

        return {
          ...lead.toObject(),
          assigned_to_name: assignedToName,
          assigned_to_full_name: assignedToFullName,
          assignments: assignmentsWithNames,
        };
      })
    );

    console.log("Leads with details fetched:", leadsWithDetails.length);

    req.data = {
      statuscode: 200,
      responseData: {
        leads: leadsWithDetails,
        totalLeads,
        totalPages: Math.ceil(totalLeads / limitNumber),
        currentPage: pageNumber,
      },
      responseMessage: "Leads retrieved successfully.",
    };
    next();
  } catch (err) {
    console.error("Error in getAllLeads:", err);
    req.err = err;
    next(err);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    req.data = { endpoint: "getLeadById" };

    const { organizationId, projectId } = req.query;
    const { leadId } = req.params;

    if (!organizationId || !projectId || !leadId) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // Find the lead directly by querying within the project and organization
    const lead = await Lead.findOne(
      {
        organizationId,
        "projects.projectId": projectId,
        "projects.leads.leadId": leadId,
      },
      {
        "projects.$": 1, // Only return the project containing the lead
      }
    );

    if (!lead || lead.projects.length === 0) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    const project = lead.projects[0];
    const foundLead = project.leads.find((l) => l.leadId === leadId);

    if (!foundLead) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    // Fetch user details for assigned_to
    const assignedToUser = foundLead.assigned_to
      ? await User.findOne({ userId: foundLead.assigned_to })
      : null;

    // Fetch user details for each assignment's assigned_by
    const assignmentsWithNames = await Promise.all(
      foundLead.assignments.map(async (assignment) => {
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
      ...foundLead.toObject(),
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

    const { projectId, leadId } = req.params;
    const { organizationId, lastCallDate, lastCallStatus, nextCallScheduled } =
      req.body;

    // Validate input
    if (
      !organizationId ||
      !projectId ||
      !leadId ||
      !lastCallDate ||
      !lastCallStatus ||
      !nextCallScheduled
    ) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // Fetch the project and find the lead within the project
    const project = await Lead.findOne({
      organizationId,
      "projects.projectId": projectId,
    });

    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    const leadIndex = project.projects[0].leads.findIndex(
      (l) => l.leadId === leadId
    );

    if (leadIndex === -1) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    const followUpHistoryEntry = {
      lastCallDate: new Date(lastCallDate),
      lastCallStatus,
      nextCallScheduled: new Date(nextCallScheduled),
    };

    // Update the lead with follow-up details
    project.projects[0].leads[leadIndex].followUp = {
      lastCallDate: new Date(lastCallDate),
      lastCallStatus,
      nextCallScheduled: new Date(nextCallScheduled),
    };

    project.projects[0].leads[leadIndex].followUpHistory.push(
      followUpHistoryEntry
    );

    const updatedProject = await Lead.findOneAndUpdate(
      {
        organizationId,
        "projects.projectId": projectId,
      },
      {
        $set: {
          "projects.$.leads.$[lead].followUp":
            project.projects[0].leads[leadIndex].followUp,
        },
        $push: {
          "projects.$.leads.$[lead].followUpHistory": followUpHistoryEntry,
        },
      },
      {
        arrayFilters: [{ "lead.leadId": leadId }],
        new: true,
      }
    );

    if (!updatedProject) {
      throw new Error(CONST_STRINGS.LEAD_UPDATE_FAILED);
    }

    req.data = {
      statuscode: 200,
      responseData: updatedProject.projects[0].leads[leadIndex],
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

    const { projectId, leadId } = req.params;
    const { stage, lastCallRemarks, assignedTo, assignedBy } = req.body;

    if (!leadId) {
      throw new Error(CONST_STRINGS.MISSING_LEAD_ID);
    }

    // Prepare update fields
    const updateFields = {};
    if (stage) {
      updateFields["projects.$[project].leads.$[lead].stage"] = stage;
    }
    if (lastCallRemarks) {
      updateFields["projects.$[project].leads.$[lead].remarks"] =
        lastCallRemarks;
    }

    const arrayFilters = [
      { "project.projectId": projectId },
      { "lead.leadId": leadId },
    ];

    if (assignedTo && assignedBy) {
      // Prepare assignment data
      const assignmentData = {
        assigned_by: assignedBy,
        assigned_to: assignedTo,
        assigned_date: new Date(),
      };

      // Add assignment data to assignments array
      updateFields["projects.$[project].leads.$[lead].assignments"] =
        assignmentData;
      updateFields["projects.$[project].leads.$[lead].assigned_to"] =
        assignedTo;
      updateFields["projects.$[project].leads.$[lead].isAssigned"] = true;
    }

    // Update the document
    const updatedLead = await Lead.findOneAndUpdate(
      { "projects.projectId": projectId, "projects.leads.leadId": leadId },
      { $set: updateFields },
      {
        arrayFilters: arrayFilters,
        new: true,
      }
    );

    if (!updatedLead) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

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

    const { projectId, leadId } = req.params; // Changed from req.body to req.params

    console.log(req.params);

    if (!leadId) {
      throw new Error(CONST_STRINGS.MISSING_LEAD_ID);
    }

    // Find the project and update by pulling the specific leadId from the leads array
    const updateResult = await Lead.updateOne(
      { "projects.projectId": projectId, "projects.leads.leadId": leadId },
      { $pull: { "projects.$.leads": { leadId } } }
    );

    if (updateResult.modifiedCount === 0) {
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

    if (!leadId || !assignedTo) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // Fetch the lead from the nested structure
    const lead = await Lead.findOne({
      "projects.leads.leadId": leadId,
    });

    if (!lead) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    // Fetch the user to whom the lead is being assigned
    const assignedToUser = await User.findOne({ userId: assignedTo });
    if (!assignedToUser) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    // Find the project and lead to update
    const projectIndex = lead.projects.findIndex((project) =>
      project.leads.some((leadItem) => leadItem.leadId === leadId)
    );

    if (projectIndex === -1) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    const leadIndex = lead.projects[projectIndex].leads.findIndex(
      (leadItem) => leadItem.leadId === leadId
    );

    if (leadIndex === -1) {
      throw new Error(CONST_STRINGS.LEAD_NOT_FOUND);
    }

    // Create a new assignment
    const newAssignment = {
      assigned_by: userId,
      assigned_to: assignedTo,
      assigned_date: new Date(),
    };

    // Push existing assignments into the assignmentHistory and clear assignments
    const existingLead = lead.projects[projectIndex].leads[leadIndex];
    const assignmentHistoryEntry = existingLead.assignments.map(
      (assignment) => ({
        ...assignment,
        assigned_date: new Date(), // Add current date to all entries
      })
    );

    lead.projects[projectIndex].leads[leadIndex].assignmentHistory = [
      ...assignmentHistoryEntry,
      newAssignment,
    ];

    lead.projects[projectIndex].leads[leadIndex].assignments = [];
    lead.projects[projectIndex].leads[leadIndex].assignments.push(
      newAssignment
    );
    lead.projects[projectIndex].leads[leadIndex].assigned_to = assignedTo;
    lead.projects[projectIndex].leads[leadIndex].isAssigned = true;
    lead.projects[projectIndex].leads[leadIndex].remarks =
      remarks || lead.projects[projectIndex].leads[leadIndex].remarks;

    // Save the updated lead
    await lead.save();

    req.data = {
      statuscode: 200,
      responseMessage: CONST_STRINGS.LEAD_ASSIGNED_SUCCESS,
      responseData: lead,
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
