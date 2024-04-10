import { CONST_STRINGS } from "../helpers/constants.js";
import { CollegeDetailsCard } from "../models/collegeData.js";
import { ENV_VAR } from "../helpers/env.js";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";

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
      collegeIdUserdefined,
    } = req.body;

    const file = req.files.collegeImage;

    // Upload image to Cloudinary
    cloudinary.uploader.upload(
      file.tempFilePath,
      { folder: "college-images" }, 
      async (err, result) => {
        if (err) {
          console.error("Error uploading image to Cloudinary:", err);
          return next(err);
        }

        // Delete temporary file
        await unlink(file.tempFilePath);

        // Check if the given collegeIdUserdefined already exists
        const existingCollege = await CollegeDetailsCard.findOne({
          collegeId: collegeIdUserdefined,
        });
        if (existingCollege) {
          throw new Error("College ID already exists");
        }

        // Check if there are any colleges in the database
        const countColleges = await CollegeDetailsCard.countDocuments({});
        let collegeId;
        let nextCollegeId;

        // If no colleges exist, set collegeId to CLG01 and nextCollegeId to CLG02
        if (countColleges === 0) {
          collegeId = "CLG01";
        } else {
          // Get the last collegeId from the database and increment it
          const lastCollege = await CollegeDetailsCard.findOne().sort({
            collegeId: -1,
          });
          const lastCollegeIdNumber = parseInt(lastCollege.collegeId.substr(3));
          collegeId = `CLG${(lastCollegeIdNumber + 1)
            .toString()
            .padStart(2, "0")}`;
        }

        // Check if collegeIdUserdefined matches the generated collegeId
        if (collegeIdUserdefined !== collegeId) {
          throw new Error("College ID already exists");
        }

        const collegeDetailsCard = new CollegeDetailsCard({
          collegeId,
          collegeName,
          collegeImage: result.secure_url,
          awayFromCollege,
          scholarship,
          dormitoryRoom,
          fees,
          rating,
          numberOfReviews,
          validity,
          numberOfMembersAllowed,
        });

        const updatedCollegeDetailsCard = await collegeDetailsCard.save();

        req.data = {
          statuscode: 200,
          responseData: { collegeDetailsCard: updatedCollegeDetailsCard },
          responseMessage: collegeId
            ? CONST_STRINGS.COLLEGE_DATA_UPDATED_SUCCESSFULLY
            : CONST_STRINGS.COLLEGE_DATA_POSTED_SUCCESSFULLY,
        };

        next();
      }
    );
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getCollegeData = async (req, res, next) => {
  try {
    req.meta = { endpoint: 'getCollegeData' };

    const {
      collegeId,
      page = 1,
      limit = 10,
      sortBy = 'collegeName',
      sortOrder = 'asc',
      filterBy = {},
    } = req.query;

    // Parse limit and page parameters
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Prepare filter options
    const filterOptions = {};

    // Apply filters if provided
    if (filterBy.collegeName) {
      filterOptions.collegeName = {
        $regex: filterBy.collegeName,
        $options: 'i',
      };
    }

    let query;

    if (collegeId) {
      query = CollegeDetailsCard.findOne({ collegeId: collegeId });
    } else {
      query = CollegeDetailsCard.find(filterOptions)
        .sort(sortOptions)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit);
    }

    const collegeDetails = await query;

    if (!collegeDetails) {
      const error = new Error(CONST_STRINGS.COLLEGE_NOT_FOUND);
      error.status = 404;
      throw error;
    }

    // If collegeId is not provided, count total number of colleges for pagination
    const totalColleges = collegeId
      ? 1
      : await CollegeDetailsCard.countDocuments(filterOptions);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalColleges / parsedLimit);

    req.data = {
      statuscode: 200,
      responseData: collegeDetails,
      pagination: collegeId
        ? undefined
        : {
            currentPage: parsedPage,
            totalPages,
            totalItems: totalColleges,
            itemsPerPage: parsedLimit,
          },
      responseMessage: CONST_STRINGS.COLLEGE_DATA_RETRIEVED_SUCCESSFULLY,
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const deleteCollegeData = async (req, res, next) => {
  try {
    req.meta = { endpoint: "deleteCollegeData" };

    const { collegeId } = req.query;

    // Check if collegeId is provided
    if (!collegeId) {
      throw new Error("College ID is required");
    }

    // Find and delete the college data
    const deletedCollege = await CollegeDetailsCard.findOneAndDelete({
      collegeId: collegeId,
    });

    if (!deletedCollege) {
      throw new Error("College data not found");
    }

    req.data = {
      statuscode: 200,
      responseData: {
        deletedCollege,
      },
      responseMessage: "College Data Deleted Successfully",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
