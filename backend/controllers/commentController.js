import Comment from "../models/Comment.js";
import Task from "../models/Task.js";

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text,
    });

    const io = req.app.get("io");
    io.emit("newComment", comment);

    await comment.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error(error);

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