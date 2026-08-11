import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  addProjectMember,
  updateProject,
  deleteProject,
  removeProjectMember,
} from "../controllers/projectController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Project
router.post("/", protect, createProject);
// Get My Projects
router.get("/", protect, getProjects);
// Get Single Project
router.get("/:projectId", protect, getProject);

// Add Member to Project
router.post(
  "/:projectId/members",
  protect,
  addProjectMember
);

// Remove Member from Project
router.delete(
  "/:projectId/members/:memberId",
  protect,
  removeProjectMember
);

// Update Project
router.put("/:projectId", protect, updateProject);

// Delete Project
router.delete("/:projectId", protect, deleteProject);

export default router;