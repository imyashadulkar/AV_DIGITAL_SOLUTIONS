import xlsx from "xlsx";
import csv from "csv-parser";
import fs from "fs/promises"; // Use fs/promises for async file operations
import { ExcelData } from "../models/index.js"; // Import your Mongoose model

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
    const filePath = `C:\Users\Admin\Desktop\RideEve${excelFile.name}`;

    await excelFile.mv(filePath);

    let jsonData = [];

    // Determine file type based on extension
    if (excelFile.name.endsWith(".xlsx")) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = xlsx.utils.sheet_to_json(worksheet);
    } else if (excelFile.name.endsWith(".csv")) {
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => {
            jsonData = results;
            resolve();
          })
          .on("error", (err) => reject(err));
      });
    } else {
      throw new Error(
        "Unsupported file format. Only Excel (.xlsx) or CSV files are supported."
      );
    }

    // Save each entry to database
    const savedEntries = await ExcelData.create({ userId, data: jsonData });

    // Clean up uploaded file after processing
    fs.unlinkSync(filePath);

    req.data = {
      statusCode: 200,
      responseData: savedEntries,
      responseMessage: "Data extracted and saved successfully",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
