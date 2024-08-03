import mongoose from "mongoose";

// Define the schema for a single lead
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
      default: "Paid",
    },
    assigned_to: { type: String, default: "Unassigned" },
    isAssigned: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Completed form", "Incomplete form"],
      default: "Incomplete form",
    },
    remarks: { type: String },
    assignments: [
      {
        assigned_by: { type: String, required: true },
        assigned_to: { type: String, required: true },
        assigned_date: { type: Date, default: Date.now },
      },
    ],
    followUp: {
      lastCallDate: { type: Date },
      lastCallStatus: {
        type: String,
        enum: ["Completed", "Pending", "Failed", "StandBy"],
      },
      nextCallScheduled: { type: Date },
    },
    assignmentHistory: [
      {
        assigned_by: { type: String },
        assigned_to: { type: String },
        assigned_date: { type: Date, default: Date.now },
      },
    ],
    followUpHistory: [
      {
        lastCallDate: { type: Date },
        lastCallStatus: {
          type: String,
          enum: ["Completed", "Pending", "Failed"],
        },
        nextCallScheduled: { type: Date },
      },
    ],
  },
  { _id: false } // No _id for this subdocument
);

// Define the schema for a project
const projectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },
    leads: [leadSchema], // Array of leads
  },
  { _id: false } // No _id for this subdocument
);

// Define the schema for the main Lead model
const leadModelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  organizationId: { type: String, required: true },
  projects: [projectSchema], // Array of projects
});

// Export the model for the Lead
export const Lead = mongoose.model("Lead", leadModelSchema);
