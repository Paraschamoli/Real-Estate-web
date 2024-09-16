import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PostDetail } from "../models/postDetail.model.js";
import jwt from "jsonwebtoken";
import { SavedPost } from "../models/savePost.js";

export const getPosts = asyncHandler(async (req, res) => {
  const { city, type, property, bedroom, minPrice, maxPrice } = req.query;

  try {
    // Create a filter object and conditionally add filters
    const filters = {};

    if (city) filters.city = city;
    if (type) filters.Type = type;
    if (property) filters.property = property;
    if (bedroom) filters.bedroom = parseInt(bedroom);

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice) || 0;
      if (maxPrice) filters.price.$lte = parseInt(maxPrice) || 100000;
    }

    // Fetch the posts with applied filters
    console.log(filters);

    const posts = await Post.find(filters);
    console.log(posts);

    return res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
});
export const getPost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const post = await Post.findById(id);

  if (!post) {
    throw new ApiError(500, "not able to fetch post");
  }
  const user = await User.findById(post.user);
  const postDetail = await PostDetail.findById(post.postDetail);
  if (!user || !postDetail) {
    throw new ApiError(500, "not able to fetch user or postDetails");
  }
  //console.log(post, postDetail, user);

  let userId;
  const token = req.cookies?.accessToken;
  if (!token) {
    userId = null;
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        userId = null;
      } else {
        userId = payload._id;
      }
    });
  }

  const saved = await SavedPost.findOne({
    user: userId,
    post: id,
  });
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        post,
        user,
        postDetail,
        isSaved: saved ? true : false,
      },
      "post fetched successfully"
    )
  );
});

export const addPost = asyncHandler(async (req, res) => {
  const body = req.body;
  const tokenUserId = req.user._id;

  try {
    // Log request body
    console.log("Request body:", body);

    // Step 1: Create PostDetail (if provided)
    let newPostDetail = null;
    if (body.postDetail) {
      console.log("Creating PostDetail:", body.postDetail);
      newPostDetail = new PostDetail(body.postDetail);
      await newPostDetail.save(); // Save post detail first
      console.log("PostDetail created:", newPostDetail); // Log PostDetail after saving
    }

    // Step 2: Create new Post
    const newPost = new Post({
      ...body.postData, // Spread the postData properties into the new Post
      user: tokenUserId, // Link the post to the authenticated user
      postDetail: newPostDetail ? newPostDetail._id : null, // Link the created PostDetail if available
    });
    console.log("Creating Post:", body.postData); // Log post data before saving
    await newPost.save();
    console.log("Post created successfully:", newPost); // Log post after saving

    // Step 3: Update the user's posts array
    await User.findByIdAndUpdate(tokenUserId, {
      $push: { posts: newPost._id }, // Add post reference to user's posts array
    });
    console.log("User updated with new post:", tokenUserId); // Log user update

    res.status(200).json(
      new ApiResponse(200, {
        newPost,
      })
    );
  } catch (err) {
    console.error("Error occurred:", err); // Log the error
    res.status(500).json(new ApiError(500, "Failed to create post"));
  }
});

export const updatePost = asyncHandler(async (req, res) => {
  //const posts = await Post.find();
});

export const deletePost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(req.user._id, id);

  const tokenUserId = req.user._id;

  try {
    const post = await Post.findById(id);
    //console.log(post);

    if (!post) {
      throw new ApiError(400, "post not found");
    }
    console.log(post.user.toString());

    if (post.user.toString() !== tokenUserId.toString()) {
      throw new ApiError(400, "unauthorized access");
    }
    //const postd=await PostDetail.findById(post.postDetail);
    await PostDetail.findByIdAndDelete(post.postDetail); // delete the detail of that post

    await Post.findByIdAndDelete(id); // delete the post

    await User.findByIdAndUpdate(tokenUserId, {
      $pull: { posts: post._id }, // Remove the post reference from the user's posts array
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "post deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "failed to delete post");
  }
});
