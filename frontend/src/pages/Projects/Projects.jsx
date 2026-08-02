import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../../services/projectService";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="project-card"
          >
            <h3>{project.name}</h3>

            <p>{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Projects;