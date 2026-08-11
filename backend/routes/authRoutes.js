import express from "express";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/password", protect, changePassword);

export default router;