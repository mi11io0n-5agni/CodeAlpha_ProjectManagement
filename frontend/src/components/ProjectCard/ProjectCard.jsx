import { Link } from "react-router-dom";
import "./ProjectCard.css";

function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-header">
        <h2>{project.title}</h2>

        <span className="status">
          {project.status}
        </span>
      </div>

      <p className="description">
        {project.description || "No description provided."}
      </p>

      <div className="project-info">
        <p>
          <strong>Owner:</strong> {project.owner?.name}
        </p>

        <p>
          <strong>Members:</strong> {project.members?.length}
        </p>
      </div>

      <Link
        to={`/projects/${project._id}`}
        className="open-btn"
      >
        Open Project
      </Link>
    </div>
  );
}

export default ProjectCard;