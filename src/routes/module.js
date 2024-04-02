import express from "express";
import { AUTH_ROUTES, MODULE_ROUTES } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";
import { postCollegeData, getCollegeData } from "../controllers/collegedata.js";

const router = express.Router();

// Unprotected Routes
router.post(MODULE_ROUTES.POST_COLLEGE_DATA, postCollegeData, successResponse);
router.get(MODULE_ROUTES.GET_COLLEGE_DATA,getCollegeData, successResponse);


export default router;
