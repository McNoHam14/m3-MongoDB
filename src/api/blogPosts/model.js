import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    author: {
      name: { type: String },
      avatar: { type: String },
    },
    content: { type: String, required: true },
    comments: [
      {
        text: { type: String, required: true },
        author: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("BlogPosts", blogPostSchema);
