import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Board from "../../components/Board/Board";
import CreateTaskModal from "../../components/CreateTaskModal/CreateTaskModal";

import { getProject } from "../../services/projectService";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { projectId } = useParams();

  const [openModal, setOpenModal] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load project information
  const loadProject = async () => {
    try {
      setLoading(true);

      const data = await getProject(projectId);

      setProject(data.project);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleTaskCreated = () => {
    setRefresh((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="project-loading">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-loading">
        Project not found.
      </div>
    );
  }

  return (
    <div className="project-details">

      {/* Project Header */}
      <div className="project-header">

        <div>
          <h1>{project.title}</h1>

          <p>
            {project.description || "Manage your project tasks."}
          </p>
        </div>

        <button
          className="add-task-btn"
          onClick={() => setOpenModal(true)}
        >
          + New Task
        </button>

      </div>

      {/* Project Members */}
      <div className="project-members-info">
        <strong>
          Members:
        </strong>

        <span>
          {project.members?.length || 0}
        </span>
      </div>

      {/* Kanban Board */}
      <Board
        projectId={projectId}
        refresh={refresh}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        projectId={projectId}
        members={project.members || []}
        onTaskCreated={handleTaskCreated}
      />

    </div>
  );
}

export default ProjectDetails;