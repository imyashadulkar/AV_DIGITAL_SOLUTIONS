import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    assigned_by: { type: String, required: true }, // User who assigned the lead
    assigned_to: { type: String, required: true }, // User to whom the lead is assigned
    assigned_date: { type: Date, default: Date.now }, // Date of assignment
  },
  { _id: false } // Do not create _id field for this subdocument
);

const followUpSchema = new mongoose.Schema(
  {
    lastCallDate: { type: Date }, // Date of the last call
    lastCallStatus: {
      type: String,
      enum: ["Completed", "Pending", "Failed", "standBy"],
    }, // Status of the last call
    nextCallScheduled: { type: Date }, // Date when the next call is scheduled
  },
  { _id: false } // Do not create _id field for this subdocument
);

const assignmentHistorySchema = new mongoose.Schema(
  {
    assigned_by: { type: String }, // User who assigned the lead
    assigned_to: { type: String }, // User to whom the lead is assigned
    assigned_date: { type: Date, default: Date.now }, // Date of assignment
  },
  { _id: false }
);

// Define the schema for storing follow-up history
const followUpHistorySchema = new mongoose.Schema(
  {
    lastCallDate: { type: Date }, // Date of the last call
    lastCallStatus: { type: String, enum: ["Completed", "Pending", "Failed"] }, // Status of the last call
    nextCallScheduled: { type: Date }, // Date when the next call is scheduled
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    organizationId: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, unique: true },
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
    isAssigned: { type: Boolean, default: false }, // Is the lead assigned to someone
    status: {
      type: String,
      enum: ["completed form", "Incomplete form"],
      default: "Incomplete form",
    },
    remarks: { type: String },
    assignments: [assignmentSchema], // Array of assignment objects
    followUp: followUpSchema, // New followUp interface
    assignmentHistory: [assignmentHistorySchema], // Array of assignment history objects
    followUpHistory: [followUpHistorySchema], // Array of follow-up history objects
  },
  { strict: true } // Only store specified fields
);

export const Lead = mongoose.model("Lead", leadSchema);
