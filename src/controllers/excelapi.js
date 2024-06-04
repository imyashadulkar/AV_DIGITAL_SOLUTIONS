import xlsx from 'xlsx';
import path from 'path';
import { promises as fs } from 'fs';

export const extractDataFromExcel = async (req, res, next) => {
  try {
    req.meta = { endpoint: "extractDataFromExcel" };

    if (!req.files || !req.files.excelFile) {
      throw new Error("No file uploaded");
    }

    const excelFile = req.files.excelFile;
    const filePath = path.join(path.dirname(''), excelFile.name);

    await excelFile.mv(filePath);

    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const worksheet = workbook.Sheets[sheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: 'NA' });

    // Clean up uploaded file after processing
    await fs.unlink(filePath);

    req.data = {
      statuscode: 200,
      responseData: jsonData || {},
      responseMessage: "Data extracted successfully",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
