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

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true
    },
    previousEmails: {
      type: Array,
      required: true,
      default: []
    },
    password: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    
    isBlocked: {
      type: Boolean,
      required: true,
      default: false
    },
    logins: {
      type: Array,
      required: true,
      default: []
    },
    emailVerification: verificationObject,
    forgotPassowrdVerification: verificationObject,
    changeEmailVerification: {
      ...verificationObject,
      currentEmailCode: {
        type: String
      },
      newEmail: {
        type: String
      }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("auth-user", userSchema);
