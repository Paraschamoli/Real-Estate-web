

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; 

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token has expired!" });
      }
      return res.status(403).json({ message: "Token is not valid!" });
    }

    try {
      // Fetch the full user object from the database
      const user = await User.findById(payload._id).select("-password -refreshToken");
      
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      // Attach the entire user object to the request
      req.user = user;

      next();
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};
