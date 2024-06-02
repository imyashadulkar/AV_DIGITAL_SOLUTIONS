import mongoose from "mongoose";

const verificationObject = {
  _id: false,
  code: {
    type: String
  },
  createdAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
};

const adminUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    logins: {
      type: Array,
      required: true,
      default: []
    },
    emailVerification: verificationObject
  },
  { timestamps: true }
);

export const AdminUser = mongoose.model("admin-user", adminUserSchema);
