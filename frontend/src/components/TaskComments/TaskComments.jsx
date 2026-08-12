import { useEffect, useState } from "react";

import {
  getComments,
  addComment,
} from "../../services/commentService";

import { connectSocket } from "../../services/socket";

import { toast } from "react-toastify";

import "./TaskComments.css";

function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // Load comments from database
  // ============================================================

  const loadComments = async () => {
    if (!taskId) return;

    try {
      setLoading(true);

      const data = await getComments(taskId);

      setComments(data.comments || []);
    } catch (error) {
      console.error(
        "Failed to load comments:",
        error
      );

      toast.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Load comments + listen for real-time comments
  // ============================================================

  useEffect(() => {
    if (!taskId) return;

    let socket;

    // ----------------------------------------------------------
    // Load existing comments
    // ----------------------------------------------------------

    loadComments();

    // ----------------------------------------------------------
    // Connect to Socket.io
    // ----------------------------------------------------------

    socket = connectSocket();

    if (!socket) {
      console.warn(
        "Comment socket was not connected."
      );

      return;
    }

    // ----------------------------------------------------------
    // Receive new comment in real time
    // ----------------------------------------------------------

    const handleNewComment = (comment) => {
      console.log(
        "💬 New comment received:",
        comment
      );

      // --------------------------------------------------------
      // Make sure this comment belongs to the task currently
      // open in this component.
      // --------------------------------------------------------

      const receivedTaskId =
        comment.taskId ||
        comment.task?._id ||
        comment.task;

      if (
        receivedTaskId?.toString() !==
        taskId.toString()
      ) {
        return;
      }

      // --------------------------------------------------------
      // Prevent duplicate comments.
      //
      // This is important because the person who creates the
      // comment already adds it from the POST response.
      // --------------------------------------------------------

      setComments((previous) => {
        const commentId =
          comment._id || comment.id;

        const alreadyExists = previous.some(
          (item) =>
            item._id?.toString() ===
            commentId?.toString()
        );

        if (alreadyExists) {
          return previous;
        }

        return [...previous, comment];
      });
    };

    // ----------------------------------------------------------
    // Socket listener
    // ----------------------------------------------------------

    socket.on(
      "newComment",
      handleNewComment
    );

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------

    return () => {
      socket.off(
        "newComment",
        handleNewComment
      );
    };
  }, [taskId]);

  // ============================================================
  // Submit comment
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      toast.warning("Please write a comment.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await addComment(
        taskId,
        trimmedText
      );

      // --------------------------------------------------------
      // Add the comment immediately for the current user.
      //
      // The socket event will also arrive, but the listener
      // prevents it from being duplicated.
      // --------------------------------------------------------

      setComments((previous) => {
        const newComment = data.comment;

        const alreadyExists = previous.some(
          (comment) =>
            comment._id?.toString() ===
            newComment._id?.toString()
        );

        if (alreadyExists) {
          return previous;
        }

        return [...previous, newComment];
      });

      setText("");

      toast.success("Comment added.");
    } catch (error) {
      console.error(
        "Failed to add comment:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Format date
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString();
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="task-comments">
      <div className="comments-header">
        <h4>
          💬 Comments
          <span>{comments.length}</span>
        </h4>
      </div>

      <div className="comments-list">
        {loading ? (
          <p className="comments-message">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="comments-message">
            No comments yet. Be the first to comment.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              className="comment"
              key={comment._id}
            >
              <div className="comment-avatar">
                {comment.user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div className="comment-content">
                <div className="comment-top">
                  <strong>
                    {comment.user?.name ||
                      "Unknown User"}
                  </strong>

                  <span>
                    {formatDate(
                      comment.createdAt
                    )}
                  </span>
                </div>

                <p>{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        className="comment-form"
        onSubmit={handleSubmit}
      >
        <textarea
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Write a comment..."
          rows="2"
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={
            submitting || !text.trim()
          }
        >
          {submitting
            ? "Sending..."
            : "Send"}
        </button>
      </form>
    </div>
  );
}

export default TaskComments;