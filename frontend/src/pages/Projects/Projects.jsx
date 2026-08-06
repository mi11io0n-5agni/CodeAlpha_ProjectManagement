import { useEffect, useMemo, useState } from "react";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import CreateProjectModal from "../../components/CreateProjectModal/CreateProjectModal";
import { getProjects } from "../../services/projectService";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

 const filteredProjects = useMemo(() => {
  return projects.filter((project) =>
    (project.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
}, [projects, search]);

  return (
    <div className="projects-page">

      <div className="projects-header">

        <div>
          <h1>Projects</h1>
          <p>Manage all your projects in one place.</p>
        </div>

        <button
          className="new-project-btn"
          onClick={() => setOpenModal(true)}
        >
          + New Project
        </button>

      </div>

      <div className="search-box">

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="projects-grid">

        {filteredProjects.length === 0 ? (
          <div className="empty-projects">
            No matching projects found.
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              reloadProjects={loadProjects}
            />
          ))
        )}

      </div>

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onProjectCreated={loadProjects}
      />

    </div>
  );
}

export default Projects;