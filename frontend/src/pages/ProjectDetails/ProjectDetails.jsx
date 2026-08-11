import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";

import Board from "../../components/Board/Board";
import CreateTaskModal from "../../components/CreateTaskModal/CreateTaskModal";
import InviteMemberModal from "../../components/InviteMemberModal/InviteMemberModal";

import { getProject } from "../../services/projectService";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { projectId } = useParams();

  const [searchParams] = useSearchParams();

  const selectedTaskId = searchParams.get("task");

  const [openModal, setOpenModal] = useState(false);

  const [openInviteModal, setOpenInviteModal] =
    useState(false);

  const [refresh, setRefresh] = useState(false);

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  // ============================
  // Load Project
  // ============================

  const loadProject = async () => {
    try {
      setLoading(true);

      const data = await getProject(projectId);

      setProject(data.project);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Load project when ID changes
  // ============================

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // ============================
  // Task Created
  // ============================

  const handleTaskCreated = () => {
    setRefresh((prev) => !prev);
  };

  // ============================
  // Member Added
  // ============================

  const handleMemberAdded = (
    updatedProject
  ) => {
    setProject(updatedProject);
  };

  // ============================
  // Loading
  // ============================

  if (loading) {
    return (
      <div className="project-loading">
        Loading project...
      </div>
    );
  }

  // ============================
  // Project Not Found
  // ============================

  if (!project) {
    return (
      <div className="project-not-found">
        <h2>Project not found</h2>

        <p>
          This project may have been deleted or
          you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="project-details">

      {/* ============================
          Project Header
      ============================ */}

      <div className="project-header">

        <div className="project-title-section">

          <h1>{project.title}</h1>

          <p>
            {project.description ||
              "Manage your project tasks."}
          </p>

        </div>

        <div className="project-header-actions">

          <button
            className="invite-member-btn"
            onClick={() =>
              setOpenInviteModal(true)
            }
          >
            + Invite Member
          </button>

          <button
            className="add-task-btn"
            onClick={() =>
              setOpenModal(true)
            }
          >
            + New Task
          </button>

        </div>

      </div>

      {/* ============================
          Project Members
      ============================ */}

      <div className="project-members-section">

        <div className="members-header">

          <div>

            <h2>
              Project Members
            </h2>

            <p>
              {project.members?.length || 0}{" "}
              member
              {project.members?.length === 1
                ? ""
                : "s"}
            </p>

          </div>

          <button
            className="members-invite-link"
            onClick={() =>
              setOpenInviteModal(true)
            }
          >
            + Add member
          </button>

        </div>

        <div className="members-list">

          {project.members?.map(
            (member) => (

              <div
                className="member-item"
                key={member._id}
              >

                <div className="member-avatar">

                  {member.name
                    ?.charAt(0)
                    .toUpperCase() || "U"}

                </div>

                <div className="member-info">

                  <strong>
                    {member.name}
                  </strong>

                  <span>
                    {member.email}
                  </span>

                </div>

                {project.owner?._id ===
                  member._id && (
                  <span className="owner-badge">
                    Owner
                  </span>
                )}

              </div>

            )
          )}

        </div>

      </div>

      {/* ============================
          Project Board
      ============================ */}

      <Board
        projectId={projectId}
        refresh={refresh}
        selectedTaskId={selectedTaskId}
      />

      {/* ============================
          Create Task Modal
      ============================ */}

      <CreateTaskModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        projectId={projectId}
        members={project.members || []}
        onTaskCreated={
          handleTaskCreated
        }
      />

      {/* ============================
          Invite Member Modal
      ============================ */}

      <InviteMemberModal
        open={openInviteModal}
        onClose={() =>
          setOpenInviteModal(false)
        }
        projectId={projectId}
        onMemberAdded={
          handleMemberAdded
        }
      />

    </div>
  );
}

export default ProjectDetails;