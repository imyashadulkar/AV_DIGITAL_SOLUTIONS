import express from "express";

import {
 extractDataFromExcel
} from "../controllers/excelapi.js";
import { AUTH_ROUTES, EXCEL_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

const router = express.Router();


router.get(
  EXCEL_ROUTES.GET_DATA_FROM_EXCEL,
  verifyToken,
  extractDataFromExcel,
  successResponse
);



export default router;
