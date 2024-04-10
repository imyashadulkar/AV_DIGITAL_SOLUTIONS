import express from "express";
import { MODULE_ROUTES } from "../helpers/constants.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";
import {
  postCollegeData,
  getCollegeData,
  deleteCollegeData,
} from "../controllers/collegedata.js";
import { cloudware } from "../middleware/cloudinary_middleware.js";
import { addBlog, deleteBlogPost, getBlog } from "../controllers/blog.js";
import { addTestimonial } from "../controllers/testimonialcontroller.js";

const router = express.Router();

// Unprotected Routes
router.post(
  MODULE_ROUTES.POST_COLLEGE_DATA,
  verifyToken,
  postCollegeData,
  successResponse
);
router.get(
  MODULE_ROUTES.GET_COLLEGE_DATA,
  verifyToken,
  getCollegeData,
  successResponse
);
router.delete(
  MODULE_ROUTES.DELETE_COLLEGE_DATA,
  verifyToken,
  deleteCollegeData,
  successResponse
);

// Blog Controllers
router.post(
  MODULE_ROUTES.ADD_BLOG_DATA,
  verifyToken,
  addBlog,
  successResponse
);
router.delete(
  MODULE_ROUTES.DELETE_BLOG,
  verifyToken,
  deleteBlogPost,
  successResponse
);
router.get(
  MODULE_ROUTES.GET_BLOG,
  verifyToken,
  verifyAdmin,
  getBlog,
  successResponse
);
//Testimonial 
router.post(
  MODULE_ROUTES.ADD_TESTIMONIAL_DATA,
  verifyToken,
  addTestimonial,
  successResponse
);

export default router;
