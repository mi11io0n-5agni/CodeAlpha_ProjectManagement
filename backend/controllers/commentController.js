import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { createNotification } from "./notificationController.js";

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;

    // ----------------------------------------------
    // Validate comment
    // ----------------------------------------------
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // ----------------------------------------------
    // Find task
    // ----------------------------------------------
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ----------------------------------------------
    // Create comment
    // ----------------------------------------------
    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text: text.trim(),
    });

    // Populate comment author
    await comment.populate(
      "user",
      "name email"
    );

    // ----------------------------------------------
    // Real-time comment
    //
    // Everyone currently viewing the project can
    // receive this board/task update.
    // ----------------------------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(task.project.toString()).emit(
        "newComment",
        {
          ...comment.toObject(),
          taskId: task._id,
          projectId: task.project,
        }
      );
    }

    // ----------------------------------------------
    // Personal notification
    //
    // Notify the task assignee only.
    // The person who wrote the comment is excluded.
    // ----------------------------------------------
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
        type: "comment",
        message: `${req.user.name || "Someone"} commented on your task: ${task.title}`,
        app: req.app,
      });
    }

    // ----------------------------------------------
    // Response
    // ----------------------------------------------
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error(
      "Add comment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Comments
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId,
    }).populate("user", "name email");

    res.status(200).json({
      success: true,
      comments,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};