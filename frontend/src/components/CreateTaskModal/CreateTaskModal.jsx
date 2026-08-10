import { useState } from "react";
import { createTask } from "../../services/taskService";
import { toast } from "react-toastify";

import "./CreateTaskModal.css";

function CreateTaskModal({
  open,
  onClose,
  projectId,
  members = [],
  onTaskCreated,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    assignedTo: "",
  });

  const [loading, setLoading] = useState(false);

  if (!open) {
    return null;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createTask({
        ...form,
        projectId,
        assignedTo: form.assignedTo || undefined,
      });

      // Reset form
      setForm({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: "",
        assignedTo: "",
      });

      onTaskCreated();
      onClose();

      toast.success("Task created successfully.");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-modal-overlay">

      <div className="task-modal">

        {/* Header */}
        <div className="task-modal-header">

          <h2>Create Task</h2>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          {/* Task Title */}
          <div className="form-group">

            <label>
              Task Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={form.title}
              onChange={handleChange}
              required
            />

          </div>

          {/* Description */}
          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Describe the task..."
              value={form.description}
              onChange={handleChange}
              rows="4"
            />

          </div>

          {/* Priority */}
          <div className="form-group">

            <label>
              Priority
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

            </select>

          </div>

          {/* Status */}
          <div className="form-group">

            <label>
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >

              <option value="todo">
                Todo
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="review">
                Review
              </option>

              <option value="done">
                Done
              </option>

            </select>

          </div>

          {/* Assign To */}
          <div className="form-group">

            <label>
              Assign To
            </label>

            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
            >

              <option value="">
                Unassigned
              </option>

              {members.map((member) => (

                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name}
                  {member.email
                    ? ` (${member.email})`
                    : ""}
                </option>

              ))}

            </select>

          </div>

          {/* Due Date */}
          <div className="form-group">

            <label>
              Due Date
            </label>

            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />

          </div>

          {/* Buttons */}
          <div className="task-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Task"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateTaskModal;