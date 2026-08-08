import { useState } from "react";
import { createProject } from "../../services/projectService";
import { toast } from "react-toastify";
import "./CreateProjectModal.css";

function CreateProjectModal({ open, onClose, onProjectCreated }) {
const [form, setForm] = useState({
  title: "",
  description: "",
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


      await createProject(form);

      setForm({
        title: "",
        description: "",
      });

      toast.success("Project created.");
      onProjectCreated();
      onClose();
      toast.success("Project created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Project</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Project Name"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Project Description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;