import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  savedPost,
  profilePosts,
  getNotificationNumber,
} from "../controllers/user.conroller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", getUsers);

//router.get("/:id", verifyJWT, getUser);

router.put("/:id", verifyJWT, updateUser);

router.delete("/:id", verifyJWT, deleteUser);

router.post("/save", verifyJWT, savedPost);

router.get("/profilePosts", verifyJWT, profilePosts);

router.get("/notification", verifyJWT, getNotificationNumber);
export default router;
