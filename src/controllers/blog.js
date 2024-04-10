import { CONST_STRINGS } from "../helpers/constants.js";
import { BlogPost } from "../models/index.js";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";

cloudinary.config({
  cloud_name: "dsswjmlin",
  api_key: "415618684491883",
  api_secret: "gjwlwSmwo8qE8HzD0UB3_gPz8zI",
});

export const addBlog = async (req, res, next) => {
  try {
    req.meta = { endpoint: "addBlog" };

    const { publishedBy, title, hashtags, tags, userId } = req.body;
    const file = req.files.image;

    cloudinary.uploader.upload(
      file.tempFilePath,
      { folder: "blog-images" },
      async (err, result) => {
        if (err) {
          console.error("Error uploading image to Cloudinary:", err);
          return next(err);
        }

        await unlink(file.tempFilePath);

        const currentDate = new Date();
        const formattedDate = currentDate
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const currentTime = currentDate
          .toTimeString()
          .slice(0, 8)
          .replace(/:/g, "");
        const blogId = `${title
          .toLowerCase()
          .replace(/\s+/g, "")}-${formattedDate}-${currentTime}`;

        const newBlogPost = new BlogPost({
          userId,
          blogId,
          publishedBy,
          title,
          image: result.secure_url,
          hashtags,
          tags,
        });

        const savedBlogPost = await newBlogPost.save();

        req.data = {
          statuscode: 201,
          responseData: savedBlogPost,
          responseMessage: CONST_STRINGS.BLOG_ADDED_SUCCESSFULLY,
        };

        next();
      }
    );
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getBlog = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getBlog" };

    const { blogId } = req.query;

    let query;

    if (blogId) {
      query = BlogPost.findOne({ blogId: blogId });
    } else {
      query = BlogPost.find();
    }

    const blogPosts = await query;

    if (!blogPosts || blogPosts.length === 0) {
      const error = new Error(CONST_STRINGS.NO_BLOG_POSTS_FOUND);
      error.status = 404;
      throw error;
    }

    req.data = {
      statuscode: 200,
      responseData: blogPosts,
      responseMessage: CONST_STRINGS.BLOG_POSTS_RETRIEVED_SUCCESSFULLY,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const deleteBlogPost = async (req, res, next) => {
  try {
    const { blogId } = req.query;

    const { userId } = req.body;

    const query = userId ? { blogId, userId } : { blogId: blogId };

    const deletedBlogPost = await BlogPost.findOneAndDelete(query);

    if (!deletedBlogPost) {
      req.data = {
        statuscode: 404,
        responseMessage: CONST_STRINGS.BLOG_POST_NOT_FOUND,
      };

      return next();
    }

    req.data = {
      statuscode: 200,
      responseMessage: CONST_STRINGS.BLOG_POST_DELETED_SUCCESSFULLY,
    };

    next();
  } catch (err) {
    next(err);
  }
};
