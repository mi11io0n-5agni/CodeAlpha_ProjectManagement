import express from "express";

import {
  createProject,
  getProjects,
  getProject,
} from "../controllers/projectController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Project
router.post("/", protect, createProject);


// Get My Projects
router.get("/", protect, getProjects);


// Get Single Project
router.get("/:projectId", protect, getProject);


export default router;