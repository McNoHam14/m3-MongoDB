import Express from "express";
import fs, { rmSync } from "fs";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkBlogPostsSchema, triggerBadRequest } from "../validation.js";
import {
  getBlogPosts,
  publicFolderPath,
  writeBlogPosts,
} from "../../lib/fs-tools.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { BlogpostsModel } from "../model.js";
import { create } from "domain";

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "strive",
  },
});

const upload = multer({ storage: cloudStorage });

const blogPostsRouter = Express.Router();

console.log(getBlogPosts());

blogPostsRouter.post(
  "/",
  checkBlogPostsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newBlogPost = new BlogPostsModel(req.body);
      const { _id } = await newBlogPost.save();

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    console.log(req.query.skip);
    console.log(req.query.limit);
    const blogPosts = await BlogPostsModel.find()
      .skip(req.query.skip)
      .limit(req.query.limit);
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `Blog Post with id ${req.params.blogPostId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
      req.params.blogPostId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `Blog Post with id ${req.params.blogPostId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const deletedBlogPost = await BlogPostsModel.findByIdAndDelete(
      req.params.blogPostId
    );
    if (deletedBlogPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Blog Post with id ${req.params.blogPostId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
    blogPost.comments.push(req.body);
    await blogPost.save();
    res.send(blogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
    res.send(blogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
      const comment = blogPost.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      );
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
      blogPost.comments = blogPost.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );
      await blogPost.save();
      res.send("Comment deleted!");
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
      const comment = blogPost.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      );
      comment.text = req.body.text;
      await blogPost.save();
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
