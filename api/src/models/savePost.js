import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SavedPost = mongoose.model("SavedPost", savedPostSchema);
