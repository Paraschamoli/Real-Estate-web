import express from "express";
import {
  login,
  logout,
  refreshAccessToken,
  register,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", verifyJWT, logout);

router.post("/refreshAccessToken", refreshAccessToken);
export default router;
