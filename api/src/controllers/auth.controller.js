import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    //console.log(user);
    const accessToken = await user.generateAccessToken();
    // console.log(accessToken);
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // console.log(user.refreshToken);

    await user.save();
   // await user.save({ validateBeforeSave: false });
   const userUp=await User.findById(userId)
      console.log(userUp);
      
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne(
    // this syntax is used for checking multiple
    {
      $or: [{ username }, { email }],
    }
  );
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  console.log(newUser);

  const createdUser = await User.findById(newUser._id).select("-password ");
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registring");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if ([username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({ username });
  //console.log(user);
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  //console.log(isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(401, "incorrect password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(loggedInUser);
});
export const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // gets new updated value
    }
  );
  const options = {
    httpOnly: true,
     secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
};

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    //console.log(user);
    const accessToken = await user.generateAccessToken();
    // console.log(accessToken);

    // console.log(user.refreshToken);

    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access  token"
    );
  }
};
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    console.log(incommingRefreshToken);
    console.log(user.refreshToken);

    if (incommingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
       secure: true,
    };

    const { accessToken } = await generateAccessToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(400, error?.message || "invalid refresh token");
  }
});
