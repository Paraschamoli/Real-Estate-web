import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if token is provided
    if (!token) {
      console.log("No token provided");
      throw new ApiError(401, "Unauthorized request: no token provided");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user from the database
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // If the user does not exist, throw an error
    if (!user) {
      console.log("Invalid token: user not found");
      throw new ApiError(401, "Unauthorized request: invalid access token");
    }

    // Attach the user to the request object
    req.user = user;
    console.log("User authenticated:", user.username);

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Log error for debugging
    console.error("JWT verification error:", error);

    // Handle JWT-specific errors (e.g., token expiration)
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized request: token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Unauthorized request: invalid token");
    } else {
      // Handle other types of errors
      throw new ApiError(401, error?.message || "Unauthorized request");
    }
  }
});
