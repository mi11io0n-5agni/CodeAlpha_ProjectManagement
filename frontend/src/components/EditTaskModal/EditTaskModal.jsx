import { useState } from "react";
import { updateTask } from "../../services/taskService";
import "./EditTaskModal.css";

function EditTaskModal({
  open,
  onClose,
  task,
  onUpdated,
}) {

  const [form, setForm] = useState(task);

  if (!open || !task) return null;

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

    } catch (err) {

      console.error(err);

      alert("Update failed.");

    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Edit Task</h2>

        <form onSubmit={handleSubmit}>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
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
            value={form.dueDate?.slice(0,10) || ""}
            onChange={handleChange}
          />

          <div className="modal-buttons">

            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit">
              Save
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditTaskModal;