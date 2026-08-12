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

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.user._id,
      priority,
      dueDate,
    });

    const io = req.app.get("io");

    // Real-time board update
    if (io) {
      io.to(projectId.toString()).emit(
        "taskCreated",
        task
      );
    }

    // Notify assigned member only
    if (
      assignedTo &&
      assignedTo.toString() !==
        req.user._id.toString()
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

    const previousStatus = task.status;

    if (previousStatus === newStatus) {
      return res.status(200).json({
        success: true,
        message: "Task status unchanged",
        task,
      });
    }

    task.status = newStatus;

    await task.save();

    const io = req.app.get("io");

    // Update board in real time
    if (io) {
      io.to(task.project.toString()).emit(
        "taskUpdated",
        task
      );
    }

    const actorId = req.user._id.toString();

    const ownerId = task.createdBy
      ? task.createdBy.toString()
      : null;

    const assigneeId = task.assignedTo
      ? task.assignedTo.toString()
      : null;

    // -------------------------------------------------------
    // Notify task owner
    // -------------------------------------------------------

    if (
      ownerId &&
      ownerId !== actorId
    ) {
      await createNotification({
        recipientId: ownerId,
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

    // -------------------------------------------------------
    // Notify assignee if the assignee is not the actor
    // AND the assignee is not already the owner.
    //
    // This prevents duplicate notifications.
    // -------------------------------------------------------

    if (
      assigneeId &&
      assigneeId !== actorId &&
      assigneeId !== ownerId
    ) {
      await createNotification({
        recipientId: assigneeId,
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

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error(
      "Update task status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update task
 *
 * Handles title, description, priority,
 * due date, status and assignment.
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

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // -------------------------------------------------------
    // Remember old values
    // -------------------------------------------------------

    const previousAssignee =
      task.assignedTo?.toString() || null;

    const previousTitle = task.title;
    const previousDescription = task.description;
    const previousPriority = task.priority;
    const previousStatus = task.status;
    const previousDueDate = task.dueDate;

    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------

    task.title = title ?? task.title;
    task.description =
      description ?? task.description;
    task.priority =
      priority ?? task.priority;
    task.status =
      status ?? task.status;
    task.dueDate =
      dueDate ?? task.dueDate;
    task.assignedTo =
      assignedTo ?? task.assignedTo;

    await task.save();

    const io = req.app.get("io");

    // Real-time board update
    if (io) {
      io.to(task.project.toString()).emit(
        "taskUpdated",
        task
      );
    }

    // -------------------------------------------------------
    // Detect changes
    // -------------------------------------------------------

    const newAssignee =
      task.assignedTo?.toString() || null;

    const ownerId = task.createdBy
      ? task.createdBy.toString()
      : null;

    const actorId = req.user._id.toString();

    const assignmentChanged =
      previousAssignee !== newAssignee;

    const titleChanged =
      previousTitle !== task.title;

    const descriptionChanged =
      previousDescription !==
      task.description;

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

    console.log(
      "========== TASK UPDATE =========="
    );

    console.log("Task:", task.title);

    console.log("Updated by:", {
      id: actorId,
      name: req.user.name,
    });

    console.log("Owner:", ownerId);
    console.log("Previous assignee:", previousAssignee);
    console.log("New assignee:", newAssignee);

    console.log(
      "Assignment changed:",
      assignmentChanged
    );

    console.log(
      "Task details changed:",
      taskDetailsChanged
    );

    console.log(
      "================================="
    );

    // -------------------------------------------------------
    // CASE 1
    // New assignee
    // -------------------------------------------------------

    if (
      assignmentChanged &&
      newAssignee &&
      newAssignee !== actorId
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

    // -------------------------------------------------------
    // CASE 2
    // Existing assignee changed task
    // -------------------------------------------------------

    if (
      !assignmentChanged &&
      taskDetailsChanged &&
      newAssignee &&
      newAssignee !== actorId &&
      newAssignee !== ownerId
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
        recipientId: newAssignee,
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

    // -------------------------------------------------------
    // CASE 3
    // Owner notification
    //
    // This is the important fix.
    //
    // If another member edits the task, the owner gets
    // notified.
    // -------------------------------------------------------

    if (
      taskDetailsChanged &&
      ownerId &&
      ownerId !== actorId
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

      // Avoid duplicate owner notification if owner is
      // also the new assignee.
      if (ownerId !== newAssignee) {
        await createNotification({
          recipientId: ownerId,
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
    }

    // -------------------------------------------------------
    // CASE 4
    // Previous assignee was removed
    // -------------------------------------------------------

    if (
      assignmentChanged &&
      previousAssignee &&
      previousAssignee !== actorId &&
      previousAssignee !== newAssignee
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

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

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

    // -------------------------------------------------------
    // Save information BEFORE deleting
    // -------------------------------------------------------

    const taskId = task._id;
    const projectId = task.project;
    const taskTitle = task.title;

    const ownerId = task.createdBy
      ? task.createdBy.toString()
      : null;

    const assignedUser = task.assignedTo
      ? task.assignedTo.toString()
      : null;

    const actorId = req.user._id.toString();

    // -------------------------------------------------------
    // Delete
    // -------------------------------------------------------

    await task.deleteOne();

    // -------------------------------------------------------
    // Real-time delete
    // -------------------------------------------------------

    const io = req.app.get("io");

    if (io) {
      io.to(projectId.toString()).emit(
        "taskDeleted",
        taskId
      );
    }

    // -------------------------------------------------------
    // Notify owner
    //
    // This is important when a member deletes the owner's
    // task.
    // -------------------------------------------------------

    if (
      ownerId &&
      ownerId !== actorId
    ) {
      await createNotification({
        recipientId: ownerId,
        actorId: req.user._id,
        projectId,
        taskId,
        type: "update",
        message: `${
          req.user.name || "Someone"
        } deleted your task: ${taskTitle}`,
        app: req.app,
      });
    }

    // -------------------------------------------------------
    // Notify assigned user if different from owner
    // -------------------------------------------------------

    if (
      assignedUser &&
      assignedUser !== actorId &&
      assignedUser !== ownerId
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