import mongoose from "mongoose";

const collegeDetailsCardSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: false,
  },
  collegeImage: {
    type: String,
    required: false,
  },
  awayFromCollege: {
    type: String,
    required: false,
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
    required: false,
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
    required: false,
  },
  numberOfMembersAllowed: {
    type: Number,
    required: false,
  },
});

export const CollegeDetailsCard = mongoose.model(
  "CollegeDetailsCard",
  collegeDetailsCardSchema
);
