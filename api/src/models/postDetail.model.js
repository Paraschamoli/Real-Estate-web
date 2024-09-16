import mongoose from "mongoose";

const postDetailschema = new mongoose.Schema({
  desc: {
    type: String,
    required: true,
  },
  utilities: {
    type: String,
  },
  pet: {
    type: String,
  },
  income: {
    type: String,
  },
  size: {
    type: Number,
  },
  school: {
    type: Number,
  },
  bus: {
    type: Number,
  },
  restaurant: {
    type: Number,
  },
  // post: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Post",
  // },
});

export const PostDetail = mongoose.model("PostDetail", postDetailschema);
