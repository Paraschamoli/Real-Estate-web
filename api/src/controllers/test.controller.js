import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const shouldBeLoggedIn = asyncHandler(async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json(new ApiError(401, "not Authenticated"));
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,)

});
export const shouldBeAdmin = asyncHandler(async (req, res) => {});
