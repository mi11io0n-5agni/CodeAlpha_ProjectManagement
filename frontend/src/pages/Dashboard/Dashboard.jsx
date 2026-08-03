import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CreateProjectModal from "../../components/CreateProjectModal/CreateProjectModal";
import StatCard from "../../components/StatCard/StatCard";

import { getProjects } from "../../services/projectService";

import "./Dashboard.css";

function Dashboard() {
  const [openModal, setOpenModal] = useState(false);

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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>TaskFlow Dashboard</h1>

        <div className="dashboard-actions">
          <button
            className="create-btn"
            onClick={() => setOpenModal(true)}
          >
            + New Project
          </button>

          <Link
            to="/projects"
            className="projects-btn"
          >
            View Projects
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Projects"
          value={projects.length}
          color="#2563eb"
        />

        <StatCard
          title="Tasks"
          value={0}
          color="#10b981"
        />

        <StatCard
          title="Completed"
          value={0}
          color="#f59e0b"
        />

        <StatCard
          title="Members"
          value={0}
          color="#ef4444"
        />
      </div>

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onProjectCreated={loadProjects}
      />
    </div>
  );
}

export default Dashboard;