import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // User ID of the creator or owner of the group
  name: { type: String, required: true },
  members: [{ type: String, ref: "User" }], // Array of user IDs who are members of the group
  admin: { type: String, ref: "User", required: true }, // User ID of the group admin
});

export const Group = mongoose.model("Group", GroupSchema);
