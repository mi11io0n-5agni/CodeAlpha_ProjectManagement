import { useEffect, useState } from "react";

import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { getProjects } from "../../services/projectService";

import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="projects-page">
      <h1>My Projects</h1>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Projects;