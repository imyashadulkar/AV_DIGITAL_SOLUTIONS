import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    testimonialId: {
      type: String,
      required: true,
      unique: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    ProfileImage: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
