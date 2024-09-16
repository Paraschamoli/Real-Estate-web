import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PostDetail } from "../models/postDetail.model.js";
import { Post } from "../models/post.model.js";
import { SavedPost } from "../models/savePost.js";
import {Chat} from "../models/chat.model.js"
export const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    //console.log(users);
    return res
      .status(200)
      .json(new ApiResponse(200, users, "all Users fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "something went wrong while fetching all users");
  }
});

export const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(500, "not able to fetch user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  // console.log(req.user._id, id);
  const { password, email, username, avatar } = req.body;
  //  console.log(req.body);

  const tokenUserId = req.user._id;
  if (id != tokenUserId) {
    throw new ApiError(400, "unauthorized access");
  }
  let updatedPassword = null;
  if (password) {
    updatedPassword = await bcrypt.hash(password, 10);
  }
  console.log(updatedPassword);
  const updateFields = {};

  if (username) {
    updateFields.username = username;
  }

  if (email) {
    updateFields.email = email;
  }
  if (avatar) {
    updateFields.avatar = avatar;
  }

  if (updatedPassword) {
    updateFields.password = updatedPassword;
  }

  const user = await User.findByIdAndUpdate(id, updateFields, {
    validateBeforeSave: true,
    new: true,
  });
  //await user.save();
  if (!user) {
    throw new ApiError(400, "failed to update user");
  }
  console.log(user);

  const { password: userPassword, ...rest } = user.toObject();

  res.status(200).json(rest);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  //console.log(req.user._id, id);

  const tokenUserId = req.user._id;
  if (id != tokenUserId) {
    throw new ApiError(400, "unauthorized access");
  }
  try {
    const posts = await Post.find({ user: id });

    // Loop through all the posts and delete each associated PostDetail
    for (const post of posts) {
      if (post.postDetail) {
        await PostDetail.findByIdAndDelete(post.postDetail); // Delete the PostDetail
      }
      await Post.findByIdAndDelete(post._id); // Delete the post
    }
    await User.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "failed to delete user");
  }
});

export const savedPost = asyncHandler(async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.user._id; // Assuming JWT authentication sets the user object in req
  console.log(postId, tokenUserId);

  try {
    // Check if the post has already been saved by this user
    const savedPost = await SavedPost.findOne({
      user: tokenUserId,
      post: postId,
    });

    if (savedPost) {
      // If the post is already saved, remove it from the saved list
      await SavedPost.findByIdAndDelete(savedPost._id);
      return res.status(200).json({ message: "Post removed from saved list" });
    } else {
      // If the post is not saved yet, create a new saved post entry
      const newSavedPost = new SavedPost({
        user: tokenUserId,
        post: postId,
      });
      await newSavedPost.save();

      return res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save post" });
  }
});

export const profilePosts = asyncHandler(async (req, res) => {
  const tokenUserId = req.user._id; // Assuming JWT authentication sets the user object in req
  console.log(tokenUserId);

  try {
    // Fetch user's own posts
    const userPosts = await Post.find({ user: tokenUserId });

    // Fetch saved posts by the user and populate the post details
    const saved = await SavedPost.find({ user: tokenUserId }).populate("post");

    // Extract the actual posts from the savedPost documents
    const savedPosts = saved.map((item) => item.post);

    // Return both user posts and saved posts
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { userPosts, savedPosts },
          "userposts and savedpost fetched"
        )
      );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to get profile posts!"));
  }
});


export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.user._id; // Assuming JWT authentication sets the user object in req

  try {
    // Count chats where the user is part of the chat but has not seen the latest messages
    const number = await Chat.countDocuments({
      users: { $in: [tokenUserId] }, // User is part of the chat
      seenBy: { $nin: [tokenUserId] }, // User has not seen the chat
    });

    res.status(200).json(number);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get notification count!' });
  }
};
