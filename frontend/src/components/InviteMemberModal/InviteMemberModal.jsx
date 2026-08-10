import { useState } from "react";
import { toast } from "react-toastify";

import { addProjectMember } from "../../services/projectService";

import "./InviteMemberModal.css";

function InviteMemberModal({
  open,
  onClose,
  projectId,
  onMemberAdded,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter the user's email.");
      return;
    }

    try {
      setLoading(true);

      const data = await addProjectMember(
        projectId,
        email.trim()
      );

      toast.success(
        data.message || "Member added successfully."
      );

      setEmail("");

      onMemberAdded?.(data.project);

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add member."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal">

        <div className="invite-modal-header">
          <div>
            <h2>Invite Member</h2>

            <p>
              Add a registered user to this project.
            </p>
          </div>

          <button
            type="button"
            className="invite-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="invite-form-group">
            <label htmlFor="member-email">
              Email Address
            </label>

            <input
              id="member-email"
              type="email"
              placeholder="Enter member email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={loading}
              autoFocus
              required
            />

            <small>
              The user must already have a TaskFlow
              account.
            </small>
          </div>

          <div className="invite-modal-actions">

            <button
              type="button"
              className="invite-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="invite-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Adding..."
                : "Add Member"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default InviteMemberModal;