import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";

import Board from "../../components/Board/Board";
import CreateTaskModal from "../../components/CreateTaskModal/CreateTaskModal";
import InviteMemberModal from "../../components/InviteMemberModal/InviteMemberModal";
import EditProjectModal from "../../components/EditProjectModal/EditProjectModal";

import {
  getProject,
  deleteProject,
  removeProjectMember,
} from "../../services/projectService";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { projectId } = useParams();

  const [searchParams] = useSearchParams();

  const selectedTaskId = searchParams.get("task");

  const [openModal, setOpenModal] = useState(false);

  const [openInviteModal, setOpenInviteModal] =
    useState(false);

  const [openEditModal, setOpenEditModal] =
    useState(false);

  const [refresh, setRefresh] = useState(false);

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const currentUser =
    JSON.parse(localStorage.getItem("user")) || {};

  const isOwner =
    project?.owner?._id?.toString() ===
    currentUser.id?.toString();

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
  // Project Updated

  const handleProjectUpdated = (
    updatedProject
  ) => {
    setProject(updatedProject);
  };

  // ============================
  // Delete Project

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(projectId);

      toast.success("Project deleted successfully.");
      navigate("/projects");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete project."
      );
    }
  };

  // ============================
  // Remove Member

  const handleRemoveMember = async (
    memberId
  ) => {
    const confirmed = window.confirm(
      "Remove this member from the project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await removeProjectMember(
        projectId,
        memberId
      );

      setProject(data.project);
      toast.success("Member removed successfully.");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove member."
      );
    }
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

          {isOwner && (
            <>
              <button
                className="invite-member-btn"
                onClick={() =>
                  setOpenEditModal(true)
                }
              >
                Edit Project
              </button>

              <button
                className="delete-project-btn"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>
            </>
          )}

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
                  member._id ? (
                  <span className="owner-badge">
                    Owner
                  </span>
                ) : isOwner ? (
                  <button
                    className="remove-member-btn"
                    onClick={() =>
                      handleRemoveMember(
                        member._id
                      )
                    }
                  >
                    Remove
                  </button>
                ) : null}

              </div>

            )
          )}

        </div>

      </div>

      {/* ============================
          Project Board
      ============================ */}

      <div className="board-wrapper">
        <Board
          projectId={projectId}
          refresh={refresh}
          selectedTaskId={selectedTaskId}
        />
      </div>

      <EditProjectModal
        open={openEditModal}
        project={project}
        onClose={() =>
          setOpenEditModal(false)
        }
        onUpdated={handleProjectUpdated}
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