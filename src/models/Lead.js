import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    assigned_by: { type: String, required: true }, // User who assigned the lead
    assigned_to: { type: String, required: true }, // User to whom the lead is assigned
    assigned_date: { type: Date, default: Date.now }, // Date of assignment
  },
  { _id: false } // Do not create _id field for this subdocument
);

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true },
    platform: { type: String, required: true },
    phone_number: { type: String, required: true },
    full_name: { type: String, required: true },
    campaign_name: { type: String, required: true },
    ad_name: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    stage: {
      type: String,
      enum: [
        "Qualified",
        "Not qualified",
        "Unread",
        "Intake",
        "Converted",
        "Lost",
      ],
      default: "Not qualified",
    },
    source: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "paid",
    },
    assigned_to: { type: String, default: "Unassigned" }, // Current assignment status
    status: {
      type: String,
      enum: ["completed form", "Incomplete form"],
      default: "Incomplete form",
    },
    remarks: { type: String },
    assignments: [assignmentSchema], // Array of assignment objects
  },
  { strict: true } // Only store specified fields
);

export const Lead = mongoose.model("Lead", leadSchema);
