import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    img: [
      {
        type: String,
        required: true,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    bedroom: {
      type: Number,
      required: true,
    },
    bathroom: {
      type: Number,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    Type: {
      type: String,
      enum: ["buy", "rent"],
      default: "buy",
    },
    property: {
      type: String,
      enum: ["apartment", "house", "condo", "land"],
      default: "apartment",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostDetail",
      required: true,
    },
    savedPost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavePost",
      },
    ],
  },
  { timestamps: true }
);
export const Post = mongoose.model("Post", postSchema);
