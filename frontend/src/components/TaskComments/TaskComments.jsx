import { useEffect, useState } from "react";

import {
  getComments,
  addComment,
} from "../../services/commentService";

import { toast } from "react-toastify";

import "./TaskComments.css";

function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
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

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

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

      setComments((prev) => [
        ...prev,
        data.comment,
      ]);

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

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString();
  };

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
          disabled={submitting || !text.trim()}
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