import express from "express";

import {
  createTask,
  getProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);

router.get(
 "/project/:projectId",
 protect,
 getProjectTasks
);

router.put(
 "/:id",
 protect,
 updateTaskStatus
);
router.put(
  "/update/:id",
  protect,
  updateTask
);
router.delete(
  "/:id",
  protect,
  deleteTask
);

export default router;