import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },

  publishedBy: {
    type: String,
    required: true,
  },
  blogId: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  hashtags: {
    type: [String],
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
});

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
