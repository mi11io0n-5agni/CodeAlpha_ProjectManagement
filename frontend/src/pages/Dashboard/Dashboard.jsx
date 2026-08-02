import { useState } from "react";
import { Link } from "react-router-dom";
import CreateProjectModal from "../../components/CreateProjectModal/CreateProjectModal";
import "./Dashboard.css";

function Dashboard() {
  const [openModal, setOpenModal] = useState(false);

  const handleProjectCreated = () => {
    alert("Project created successfully!");
  };

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

          <Link to="/projects" className="projects-btn">
            View Projects
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>0</h2>
          <p>Total Projects</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Total Tasks</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Completed Tasks</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Team Members</p>
        </div>
      </div>

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}

export default Dashboard;