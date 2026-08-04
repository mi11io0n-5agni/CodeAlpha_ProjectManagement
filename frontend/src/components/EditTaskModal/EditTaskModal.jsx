import { useEffect, useState } from "react";

import { updateTask } from "../../services/taskService";

import "./EditTaskModal.css";

function EditTaskModal({
  open,
  onClose,
  task,
  onUpdated,
}) {
  const [form, setForm] =useState({
    title:"",
    description:"",
    priority:"medium",
    status:"todo",
    dueDate:"",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        dueDate: task.dueDate
          ? task.dueDate.substring(0,10)
          : "",
      });
    }
  }, [task]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await updateTask(task._id, form);

      onUpdated();

      onClose();

    } catch (error) {

      console.error(error);

      alert("Failed to update task.");

    }
  };

  return (
    <div className="edit-modal-overlay">

      <div className="edit-modal">

        <h2>Edit Task</h2>

        <form onSubmit={handleSubmit}>

          <label>Title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            rows="4"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <label>Priority</label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>

            <option value="medium">Medium</option>

            <option value="high">High</option>
          </select>

          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="todo">Todo</option>

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

          <label>Due Date</label>

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />

          <div className="edit-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditTaskModal;