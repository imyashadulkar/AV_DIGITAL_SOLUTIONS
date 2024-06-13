import xlsx from "xlsx";
import { Lead } from "../models/index.js";
import { CONST_STRINGS } from "../helpers/constants.js";
import { stripPrefix, stripValuePrefix } from "../helpers/apiHelper.js";

export const extractDataFromExcel = async (req, res, next) => {
  try {
    req.meta = { endpoint: "extractDataFromExcel" };

    if (!req.files.excelFile) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
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
      const cleanLead = {};

      // Process each field in the Excel data
      Object.keys(leadData).forEach((key) => {
        const cleanKey = stripPrefix(key); // Strip prefix from field name
        const value = leadData[key];

        // Strip prefix from value if it's a string
        const cleanValue = stripValuePrefix(value);

        // Convert to Date object if it's a date field
        if (cleanKey === "date" || cleanKey === "created_time") {
          cleanLead[cleanKey] = new Date(cleanValue);
        } else {
          cleanLead[cleanKey] = cleanValue;
        }
      });

      return cleanLead;
    });

    // Insert or update leads ensuring unique id
    const bulkOptions = leadsToSave.map((lead) => ({
      updateOne: {
        filter: { id: lead.id },
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
      responseMessage: CONST_STRINGS.DATA_SAVE_SUCCESS,
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
