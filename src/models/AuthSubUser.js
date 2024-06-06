import mongoose from "mongoose";

const authSubUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    subUserId: {
      type: String,
      required: true,
      unique: true
    },
    subUsername: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const AuthSubUser = mongoose.model("auth-sub-user", authSubUserSchema);
