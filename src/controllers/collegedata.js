import { CONST_STRINGS } from "../helpers/constants.js";
import { CollegeDetailsCard } from "../models/collegeData.js";
import { ENV_VAR } from "../helpers/env.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dsswjmlin",
  api_key: "415618684491883",
  api_secret: "gjwlwSmwo8qE8HzD0UB3_gPz8zI",
});

export const postCollegeData = async (req, res, next) => {
    try {
      req.meta = { endpoint: "postCollegeData" };
  
      const {
        collegeName,
        awayFromCollege,
        scholarship,
        dormitoryRoom,
        fees,
        rating,
        numberOfReviews,
        validity,
        numberOfMembersAllowed,
      } = req.body;
  
      const file = req.files.collegeImage;
  
      // Upload image to Cloudinary
      cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        if (err) {
          console.error('Error uploading image to Cloudinary:', err);
          return next(err);
        }
  
  
        let collegeDetailsCard;
  
        // Check if college ID is provided in request params
        if (req.params.id) {
          // Edit existing college data
          collegeDetailsCard = await CollegeDetailsCard.findById(req.params.id);
          if (!collegeDetailsCard) {
            throw new Error(CONST_STRINGS.COLLEGE_DATA_NOT_FOUND);
          }
        } else {
          // Create new college data
          collegeDetailsCard = new CollegeDetailsCard();
        }
  
        // Update fields
        collegeDetailsCard.collegeName = collegeName;
        collegeDetailsCard.collegeImage = result.secure_url; 
        collegeDetailsCard.awayFromCollege = awayFromCollege;
        collegeDetailsCard.scholarship = scholarship;
        collegeDetailsCard.dormitoryRoom = dormitoryRoom;
        collegeDetailsCard.fees = fees;
        collegeDetailsCard.rating = rating;
        collegeDetailsCard.numberOfReviews = numberOfReviews;
        collegeDetailsCard.validity = validity;
        collegeDetailsCard.numberOfMembersAllowed = numberOfMembersAllowed;
  
        const updatedCollegeDetailsCard = await collegeDetailsCard.save();
  
        req.data = {
          statuscode: req.params.id ? 200 : 201,
          responseData: { collegeDetailsCard: updatedCollegeDetailsCard },
          responseMessage: req.params.id
            ? CONST_STRINGS.COLLEGE_DATA_UPDATED_SUCCESSFULLY
            : CONST_STRINGS.COLLEGE_DATA_POSTED_SUCCESSFULLY,
        };
  
        next();
      });
    } catch (err) {
      req.err = err;
      next(err);
    }
  };

export const getCollegeData = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getCollegeData" };

    const {
      page = 1,
      limit = 10,
      sortBy = "collegeName",
      sortOrder = "asc",
      filterBy = {},
    } = req.query;
    console.log({ data: req.query });

    // Parse limit and page parameters
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Prepare filter options
    const filterOptions = {};

    // Apply filters if provided
    if (filterBy.collegeName) {
      filterOptions.collegeName = {
        $regex: filterBy.collegeName,
        $options: "i",
      };
    }

    // Fetch colleges with pagination, sorting, and filtering
    const collegeDetailsCards = await CollegeDetailsCard.find(filterOptions)
      .sort(sortOptions)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    // Count total number of colleges
    const totalColleges =
      await CollegeDetailsCard.countDocuments(filterOptions);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalColleges / parsedLimit);

    req.data = {
      statuscode: 200,
      responseData: {
        collegeDetailsCards,
        currentPage: parsedPage,
        totalPages,
        totalColleges,
      },
      responseMessage: CONST_STRINGS.COLLEGE_DATA_RETRIEVED_SUCCESSFULLY,
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
