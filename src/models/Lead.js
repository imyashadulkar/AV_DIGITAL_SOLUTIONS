import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    phone_number: { type: String, required: true },
    full_name: { type: String, required: true },
    campaign_name: { type: String, required: true },
    ad_name: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    stage: {
      type: String,
      enum: ["qualified", "Not qualified"],
      default: "Not qualified",
    },
    source: {
      type: String,
      enum: ["paid", "organic"],
      default: "paid",
    },
    assigned_to: {
      type: String,
      enum: ["Unassigned", "Assigned"],
      default: "Unassigned",
    },
    status: {
      type: String,
      enum: ["completed form", "incomplete form"],
      default: "incomplete form",
    },
  },
  { strict: true } // Only store specified fields
);

export const Lead = mongoose.model("Lead", leadSchema);
