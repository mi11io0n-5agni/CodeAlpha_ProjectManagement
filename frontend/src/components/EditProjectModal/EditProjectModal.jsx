import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateProject } from "../../services/projectService";
import "./EditProjectModal.css";

function EditProjectModal({
  open,
  project,
  onClose,
  onUpdated,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "active",
      });
    }
  }, [project]);

  if (!open || !project) {
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

      const data = await updateProject(
        project._id,
        form
      );

      toast.success(
        data.message || "Project updated successfully."
      );

      onUpdated?.(data.project);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Project</h2>

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
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;
