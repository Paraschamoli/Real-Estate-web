import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.controller.js";
const router = express.Router();

router.get("/", getPosts);

router.get("/:id", getPost);

router.post("/", verifyJWT, addPost);

router.put("/:id", verifyJWT, updatePost);

router.delete("/:id", verifyJWT, deletePost);

export default router;
