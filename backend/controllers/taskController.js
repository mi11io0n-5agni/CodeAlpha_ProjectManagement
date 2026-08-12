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
    // ------------------------------------------

    const io = req.app.get("io");

    if (io) {
      io.to(projectId.toString()).emit("taskCreated", task);
    }

    // ------------------------------------------
    // Personal notification
    //
    // Only the assigned user receives it.
    // The creator does not receive their own
    // assignment notification.
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
 *
 * Used by drag and drop.
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

    // Nothing changed
    if (previousStatus === newStatus) {
      return res.status(200).json({
        success: true,
        message: "Task status unchanged",
        task,
      });
    }

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
    // Notify assigned user
    //
    // Do not notify the person who performed
    // the drag and drop.
    // ------------------------------------------

    if (
      task.assignedTo &&
      task.assignedTo.toString() !==
        req.user._id.toString()
    ) {
      await createNotification({
        recipientId: task.assignedTo,
        actorId: req.user._id,
        projectId: task.project,
        taskId: task._id,
        type: "update",
        message: `${
          req.user.name || "Someone"
        } moved "${task.title}" from ${formatStatus(
          previousStatus
        )} to ${formatStatus(newStatus)}`,
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
      message: "Task status updated successfully",
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
 *
 * Handles title, description, priority, due date,
 * status and assignment.
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
    // Remember previous values BEFORE update
    // ------------------------------------------

    const previousAssignee =
      task.assignedTo?.toString() || null;

    const previousTitle = task.title;
    const previousDescription = task.description;
    const previousPriority = task.priority;
    const previousStatus = task.status;
    const previousDueDate = task.dueDate;

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
    // ------------------------------------------

    const io = req.app.get("io");

    if (io) {
      io.to(task.project.toString()).emit(
        "taskUpdated",
        task
      );
    }

    // ------------------------------------------
    // Detect changes
    // ------------------------------------------

    const newAssignee =
      task.assignedTo?.toString() || null;

    const assignmentChanged =
      previousAssignee !== newAssignee;

    const titleChanged =
      previousTitle !== task.title;

    const descriptionChanged =
      previousDescription !== task.description;

    const priorityChanged =
      previousPriority !== task.priority;

    const statusChanged =
      previousStatus !== task.status;

    const dueDateChanged =
      String(previousDueDate || "") !==
      String(task.dueDate || "");

    const taskDetailsChanged =
      titleChanged ||
      descriptionChanged ||
      priorityChanged ||
      statusChanged ||
      dueDateChanged;

    // ------------------------------------------
    // DEBUG
    // ------------------------------------------

    console.log("========== TASK UPDATE ==========");

    console.log("Task:", task.title);

    console.log("Updated by:", {
      id: req.user._id.toString(),
      name: req.user.name,
    });

    console.log("Previous assignee:", previousAssignee);
    console.log("New assignee:", newAssignee);

    console.log("Assignment changed:", assignmentChanged);
    console.log("Title changed:", titleChanged);
    console.log("Description changed:", descriptionChanged);
    console.log("Priority changed:", priorityChanged);
    console.log("Status changed:", statusChanged);
    console.log("Due date changed:", dueDateChanged);

    console.log("=================================");

    // ========================================================
    // CASE 1: NEW ASSIGNEE
    // ========================================================

    if (
      assignmentChanged &&
      newAssignee &&
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

    // ========================================================
    // CASE 2: EXISTING ASSIGNEE
    //
    // If task details changed, notify the existing assignee.
    // But don't notify the user who made the change.
    // ========================================================

    if (
      !assignmentChanged &&
      taskDetailsChanged &&
      task.assignedTo &&
      task.assignedTo.toString() !==
        req.user._id.toString()
    ) {
      const changes = [];

      if (titleChanged) {
        changes.push("title");
      }

      if (descriptionChanged) {
        changes.push("description");
      }

      if (priorityChanged) {
        changes.push("priority");
      }

      if (statusChanged) {
        changes.push("status");
      }

      if (dueDateChanged) {
        changes.push("due date");
      }

      await createNotification({
        recipientId: task.assignedTo,
        actorId: req.user._id,
        projectId: task.project,
        taskId: task._id,
        type: "update",
        message: `${
          req.user.name || "Someone"
        } updated ${changes.join(
          ", "
        )} on your task: ${task.title}`,
        app: req.app,
      });
    }

    // ========================================================
    // CASE 3: REASSIGNMENT
    //
    // Previous assignee is no longer assigned.
    // Notify them that the task was reassigned.
    // ========================================================

    if (
      assignmentChanged &&
      previousAssignee &&
      previousAssignee !== req.user._id.toString()
    ) {
      await createNotification({
        recipientId: previousAssignee,
        actorId: req.user._id,
        projectId: task.project,
        taskId: task._id,
        type: "update",
        message: `${
          req.user.name || "Someone"
        } reassigned the task "${task.title}" to another member`,
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

    // ------------------------------------------
    // Save information BEFORE deleting
    // ------------------------------------------

    const taskId = task._id;
    const projectId = task.project;
    const taskTitle = task.title;
    const assignedUser = task.assignedTo
      ? task.assignedTo.toString()
      : null;

    // ------------------------------------------
    // Delete task
    // ------------------------------------------

    await task.deleteOne();

    // ------------------------------------------
    // Real-time delete
    // ------------------------------------------

    const io = req.app.get("io");

    if (io) {
      io.to(projectId.toString()).emit(
        "taskDeleted",
        taskId
      );
    }

    // ------------------------------------------
    // Notify assigned user
    //
    // The person deleting the task should not
    // receive their own notification.
    // ------------------------------------------

    if (
      assignedUser &&
      assignedUser !== req.user._id.toString()
    ) {
      await createNotification({
        recipientId: assignedUser,
        actorId: req.user._id,
        projectId,
        taskId,
        type: "update",
        message: `${
          req.user.name || "Someone"
        } deleted your assigned task: ${taskTitle}`,
        app: req.app,
      });
    }

    // ------------------------------------------
    // Response
    // ------------------------------------------

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

/**
 * Convert internal status value into readable text.
 */
const formatStatus = (status) => {
  const statusLabels = {
    todo: "Todo",
    "in-progress": "In Progress",
    review: "Review",
    done: "Done",
  };

  return statusLabels[status] || status;
};