import mongoose from "mongoose";

const collegeDetailsCardSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
    },
    collegeImage: {
      type: String,
      required: true,
    },
    awayFromCollege: {
      type: String,
      required: true,
    },
    scholarship: {
      type: Boolean,
      default: false,
    },
    dormitoryRoom: {
      bedType: {
        type: String,
        enum: ["twin", "single", "double"], // assuming multiple bed types possible
      },
      bathroomType: {
        type: String,
        enum: ["shared", "private"], // assuming only two types of bathrooms
      },
    },
    fees: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    validity: {
      type: Date,
      required: true,
    },
    numberOfMembersAllowed: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CollegeDetailsCard = mongoose.model(
  "CollegeDetailsCard",
  collegeDetailsCardSchema
);
