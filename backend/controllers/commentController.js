import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { createNotification } from "./notificationController.js";

// ============================================================
// Add Comment
// ============================================================

export const addComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;

    // --------------------------------------------------------
    // Validate comment
    // --------------------------------------------------------

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // --------------------------------------------------------
    // Find task
    // --------------------------------------------------------

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // --------------------------------------------------------
    // Create comment
    // --------------------------------------------------------

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text: text.trim(),
    });

    // Populate comment author
    await comment.populate("user", "name email");

    // --------------------------------------------------------
    // Socket.io
    // --------------------------------------------------------

    const io = req.app.get("io");

    // --------------------------------------------------------
    // 1. Update everyone viewing the project
    // --------------------------------------------------------

    if (io) {
      io.to(task.project.toString()).emit("newComment", {
        ...comment.toObject(),
        taskId: task._id,
        projectId: task.project,
      });
    }

    // --------------------------------------------------------
    // 2. Personal notification for task assignee
    // --------------------------------------------------------

    if (
      task.assignedTo &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      await createNotification({
        recipientId: task.assignedTo,
        actorId: req.user._id,
        projectId: task.project,
        taskId: task._id,
        type: "comment",
        message: `${
          req.user.name || "Someone"
        } commented on your task: ${task.title}`,
        app: req.app,
      });

      // ------------------------------------------------------
      // Direct real-time comment event to the assignee.
      //
      // This makes the comment appear immediately without
      // requiring User B to refresh the page.
      // ------------------------------------------------------

      if (io) {
        io.to(`user:${task.assignedTo.toString()}`).emit(
          "commentNotification",
          {
            id: comment._id,
            _id: comment._id,
            type: "comment",
            message: `${
              req.user.name || "Someone"
            } commented on your task: ${task.title}`,
            taskId: task._id,
            projectId: task.project,
            comment: comment,
          }
        );
      }
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================================
// Get Comments
// ============================================================

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId,
    }).populate("user", "name email");

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};