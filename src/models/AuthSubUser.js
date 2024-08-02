import mongoose from "mongoose";

const permissionEnum = ["Read", "Write", "Read&Write", "Owner", "ProjectLead"];

const authSubUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    organizationId: {
      type: String,
      required: true,
    },
    subUserId: {
      type: String,
      required: true,
      unique: true,
    },
    subUsername: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      enum: permissionEnum,
      default: "Read",
    },
    projects: [
      {
        projectId: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const AuthSubUser = mongoose.model("auth-sub-user", authSubUserSchema);
