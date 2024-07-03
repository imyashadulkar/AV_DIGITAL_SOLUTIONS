import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  chatId: { type: String, required: true },
  participants: [{ type: String, ref: "User" }],
  messages: [
    {
      sender: { type: String, ref: "User" },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export const Chat = mongoose.model("Chat", ChatSchema);
