import xlsx from "xlsx";
import csvParser from "csv-parser";
import { ExcelData } from "../models/index.js";

export const extractDataFromExcel = async (req, res, next) => {
  try {
    req.meta = { endpoint: "extractDataFromExcel" };

    const { userId } = req.body;

    if (!userId) {
      throw new Error("Missing userId in request body");
    }

    if (!req.files || !req.files.excelFile) {
      throw new Error("No Excel file uploaded");
    }

    const excelFile = req.files.excelFile;
    const buffer = excelFile.data; // Assuming file is uploaded in memory as a buffer

    let jsonData = [];

    // Determine file type based on content or extension
    if (excelFile.name.endsWith(".xlsx")) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = xlsx.utils.sheet_to_json(worksheet);
    } else if (excelFile.name.endsWith(".csv")) {
      const results = [];
      const stream = buffer
        .toString()
        .split("\n")
        .map((line) => csvParser(line));

      for await (const data of stream) {
        results.push(data);
      }

      jsonData = results;
    } else {
      throw new Error(
        "Unsupported file format. Only Excel (.xlsx) or CSV files are supported."
      );
    }

    // Save each entry to database
    const savedEntries = await ExcelData.create({ userId, data: jsonData });

    req.data = {
      statuscode: 200,
      responseData: savedEntries,
      responseMessage: "Data extracted and saved successfully",
    };

    next();
  } catch (err) {
    console.error("Error in extractDataFromExcel:", err);
    req.err = err;
    next(err);
  }
};
