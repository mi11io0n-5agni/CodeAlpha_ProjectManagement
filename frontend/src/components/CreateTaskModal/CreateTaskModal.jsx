import { useState } from "react";
import { createTask } from "../../services/taskService";
import "./CreateTaskModal.css";

function CreateTaskModal({
  open,
  onClose,
  projectId,
  onTaskCreated,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      await createTask({
        ...form,
        projectId,
      });

      setForm({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: "",
      });

      onTaskCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">

        <h2>Create Task</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows="4"
          />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />

          <div className="task-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateTaskModal;