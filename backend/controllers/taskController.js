import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { createNotification } from "./notificationController.js";

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    // ------------------------------------------
    // Validate title
    // ------------------------------------------
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    // ------------------------------------------
    // Validate project ID
    // ------------------------------------------
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // ------------------------------------------
    // Check project
    // ------------------------------------------
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ------------------------------------------
    // Create task
    // ------------------------------------------
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.user._id,
      priority,
      dueDate,
    });

    // ------------------------------------------
    // Real-time board update
    //
    // Everyone in the project should see the
    // new task on the board.
    // ------------------------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(projectId.toString()).emit("taskCreated", task);
    }

    // ------------------------------------------
    // Notification debug
    // ------------------------------------------
    console.log("========== NOTIFICATION DEBUG ==========");

    console.log("Task creator:", {
      id: req.user._id.toString(),
      name: req.user.name,
    });

    console.log("Task assignedTo:", {
      id: assignedTo ? assignedTo.toString() : null,
    });

    console.log(
      "Same user?",
      assignedTo?.toString() === req.user._id.toString()
    );

    console.log("=========================================");

    // ------------------------------------------
    // Personal notification
    //
    // Only the assigned user receives this.
    // The creator does not receive their own
    // notification.
    // ------------------------------------------
    if (
      assignedTo &&
      assignedTo.toString() !== req.user._id.toString()
    ) {
      await createNotification({
        recipientId: assignedTo,
        actorId: req.user._id,
        projectId,
        taskId: task._id,
        type: "task",
        message: `${
          req.user.name || "Someone"
        } assigned you a task: ${task.title}`,
        app: req.app,
      });
    }

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get all tasks belonging to a project
 */
export const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get project tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get a single task
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update only the task status
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const allowedStatus = [
      "todo",
      "in-progress",
      "review",
      "done",
    ];

    const newStatus = req.body.status;

    if (!allowedStatus.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    // ------------------------------------------
    // Remember old status
    // ------------------------------------------
    const previousStatus = task.status;

    // ------------------------------------------
    // Update status
    // ------------------------------------------
    task.status = newStatus;

    await task.save();

    // ------------------------------------------
    // Real-time project update
    // ------------------------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(task.project.toString()).emit(
        "taskUpdated",
        task
      );
    }

    // ------------------------------------------
    // Notify task assignee
    //
    // Do not notify the person who changed the
    // task themselves.
    // ------------------------------------------
    if (
      task.assignedTo &&
      task.assignedTo.toString() !==
        req.user._id.toString() &&
      previousStatus !== newStatus
    ) {
      await createNotification({
        recipientId: task.assignedTo,
        actorId: req.user._id,
        projectId: task.project,
        taskId: task._id,
        type: "update",
        message: `${
          req.user.name || "Someone"
        } changed "${task.title}" from ${previousStatus} to ${newStatus}`,
        app: req.app,
      });
    }

    // ------------------------------------------
    // Populate task
    // ------------------------------------------
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Task updated",
      task,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update task
 */
export const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
    } = req.body;

    // ------------------------------------------
    // Find task
    // ------------------------------------------
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ------------------------------------------
    // Remember previous assignee
    // ------------------------------------------
    const previousAssignee =
      task.assignedTo?.toString() || null;

    // ------------------------------------------
    // Update fields
    // ------------------------------------------
    task.title = title ?? task.title;
    task.description =
      description ?? task.description;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;
    task.dueDate = dueDate ?? task.dueDate;
    task.assignedTo =
      assignedTo ?? task.assignedTo;

    await task.save();

    // ------------------------------------------
    // Real-time project update
    //
    // Everyone in the project should see the
    // updated task.
    // ------------------------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(task.project.toString()).emit(
        "taskUpdated",
        task
      );
    }

    // ------------------------------------------
    // Detect reassignment
    // ------------------------------------------
    const newAssignee =
      task.assignedTo?.toString() || null;

    const assignmentChanged =
      newAssignee &&
      newAssignee !== previousAssignee;

    // ------------------------------------------
    // Notification debug
    // ------------------------------------------
    console.log("========== ASSIGNMENT DEBUG ==========");

    console.log("Task updater:", {
      id: req.user._id.toString(),
      name: req.user.name,
    });

    console.log("Previous assignee:", previousAssignee);

    console.log("New assignee:", newAssignee);

    console.log(
      "Assignment changed:",
      assignmentChanged
    );

    console.log(
      "Is new assignee the updater?",
      newAssignee === req.user._id.toString()
    );

    console.log("=======================================");

    // ------------------------------------------
    // Notify NEW assignee only
    // ------------------------------------------
    if (
      assignmentChanged &&
      newAssignee !== req.user._id.toString()
    ) {
      await createNotification({
        recipientId: newAssignee,
        actorId: req.user._id,
        projectId: task.project,
        taskId: task._id,
        type: "task",
        message: `${
          req.user.name || "Someone"
        } assigned you a task: ${task.title}`,
        app: req.app,
      });
    }

    // ------------------------------------------
    // Populate task
    // ------------------------------------------
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Delete task
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    // ------------------------------------------
    // Real-time delete
    // ------------------------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(task.project.toString()).emit(
        "taskDeleted",
        task._id
      );
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};