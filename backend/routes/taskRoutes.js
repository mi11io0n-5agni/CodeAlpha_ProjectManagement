import express from "express";

import {
 createTask,
 getProjectTasks,
 updateTaskStatus
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

export default router;