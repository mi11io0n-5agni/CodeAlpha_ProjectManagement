import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  addComment,
  getComments,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", protect, addComment);

router.get("/:taskId", protect, getComments);

export default router;