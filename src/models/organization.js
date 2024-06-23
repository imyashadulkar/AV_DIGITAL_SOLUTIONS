import mongoose from "mongoose";

const organizationContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const organizationAddressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
});

const organizationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    organizationId: {
      type: String,
      required: true,
      unique: true,
    },
    subUsers: {
      type: [String],
      default: [],
    },
    organizationName: {
      type: String,
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
    },
    organizationContact: organizationContactSchema,
    organizationAddress: organizationAddressSchema,
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model("Organization", organizationSchema);
