import mongoose from "mongoose";

const previousValiditySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    currentValidity: {
      type: String,
      required: true,
    },
    validityLastUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    approvedBy: {
      type: String,
      required: true,
    },
    approverRemarks: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const licenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    currentValidity: {
      type: String,
      required: true,
    },
    validityLastUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    approvedBy: {
      type: String,
      required: true,
    },
    subUsers: {
      type: String,
      default: [],
    },
    approverRemarks: {
      type: String,
      required: true,
    },
    previousValidityMap: {
      type: Map,
      of: previousValiditySchema,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const License = mongoose.model("license", licenseSchema);
