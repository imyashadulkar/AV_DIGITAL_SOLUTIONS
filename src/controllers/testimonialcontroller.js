import { CONST_STRINGS } from "../helpers/constants.js";
import { Testimonial } from "../models/index.js";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";

cloudinary.config({
  cloud_name: "dsswjmlin",
  api_key: "415618684491883",
  api_secret: "gjwlwSmwo8qE8HzD0UB3_gPz8zI",
});

export const addTestimonial = async (req, res, next) => {
    try {
      req.meta = { endpoint: 'addTestimonial' };
  
      const { uploadedBy, Name, Description } = req.body;
      const file = req.files.ProfileImage;
  
      cloudinary.uploader.upload(
        file.tempFilePath,
        { folder: 'profile-images' }, 
        async (err, result) => {
          if (err) {
            console.error("Error uploading image to Cloudinary:", err);
            return next(err);
          }
  
          try {
            // Generate TestimonialId based on date uploaded and testimonial name
            const dateUploaded = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const testimonialId = `${dateUploaded}_${Name}`;
  
            // Create a new testimonial with the uploaded image URL
            const newTestimonial = new Testimonial({
              testimonialId,
              uploadedBy,
              Name,
              ProfileImage: result.secure_url,
              Description,
            });
  
            const savedTestimonial = await newTestimonial.save();
  
            await unlink(file.tempFilePath);
  
            req.data = {
              statuscode: 200,
              responseData: savedTestimonial,
              responseMessage: CONST_STRINGS.TESTIMONIAL_ADDED_SUCCESSFULLY,
            };
  
            next();
          } catch (error) {
            console.error("Error generating testimonialId:", error);
            next(error);
          }
        }
      );
    } catch (error) {
      next(error);
    }
  };

  export const getTestimonial = async (req, res, next) => {
    try {
      req.meta = { endpoint: 'getTestimonial' };
  
      const { testimonialId } = req.query;
  
      let query;
  
      if (testimonialId) {
        query = Testimonial.findOne({ testimonialId: testimonialId });
      } else {
        query = Testimonial.find();
      }
  
      const testimonials = await query;
  
      if (!testimonials || testimonials.length === 0) {
        const error = new Error(CONST_STRINGS.NO_TESTIMONIALS_FOUND);
        error.status = 404;
        throw error;
      }
  
      req.data = {
        statuscode: 200,
        responseData: testimonials,
        responseMessage: testimonialId
          ? CONST_STRINGS.TESTIMONIAL_RETRIEVED_SUCCESSFULLY
          : CONST_STRINGS.TESTIMONIALS_RETRIEVED_SUCCESSFULLY,
      };
  
      next();
    } catch (error) {
      next(error);
    }
  };
  


