import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CreateProjectModal from "../../components/CreateProjectModal/CreateProjectModal";
import StatCard from "../../components/StatCard/StatCard";

import { getDashboardStats } from "../../services/dashboardService";

import "./Dashboard.css";

function Dashboard() {
  const [openModal, setOpenModal] = useState(false);

  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completed: 0,
    members: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();

      setStats(data.stats);
      setRecentProjects(data.recentProjects);
      setRecentTasks(data.recentTasks);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const completionRate =
    stats.tasks === 0
      ? 0
      : Math.round((stats.completed / stats.tasks) * 100);

  return (
    <div className="dashboard">

      <div className="dashboard-hero">

        <div>
          <h1>Welcome Back 👋</h1>

          <p>
            Manage your projects, monitor your progress,
            and keep your team productive.
          </p>
        </div>

        <div className="dashboard-buttons">

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
          value={stats.projects}
          icon="📁"
          color="#2563eb"
        />

        <StatCard
          title="Tasks"
          value={stats.tasks}
          icon="📋"
          color="#10b981"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon="✅"
          color="#f59e0b"
        />

        <StatCard
          title="Members"
          value={stats.members}
          icon="👥"
          color="#ef4444"
        />

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="card-header">
            <h2>Recent Projects</h2>

            <Link to="/projects">
              View All
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="empty-state">
              No projects available.
            </div>
          ) : (
            recentProjects.map((project) => (
              <div
                key={project._id}
                className="list-item"
              >
                <div>

                  <h4>{project.title}</h4>

                  <p>
                    {project.description ||
                      "No description"}
                  </p>

                </div>

                <span className="project-tag">
                  Active
                </span>

              </div>
            ))
          )}

        </div>

        <div className="dashboard-card">

          <div className="card-header">
            <h2>Recent Tasks</h2>
          </div>

          {recentTasks.length === 0 ? (
            <div className="empty-state">
              No tasks available.
            </div>
          ) : (
            recentTasks.map((task) => (
              <div
                key={task._id}
                className="list-item"
              >
                <div>

                  <h4>{task.title}</h4>

                  <p>
                    Priority: {task.priority}
                  </p>

                </div>

                <span
                  className={`status ${task.status}`}
                >
                  {task.status}
                </span>

              </div>
            ))
          )}

        </div>

      </div>

      <div className="dashboard-card progress-card">

        <div className="card-header">

          <h2>Project Progress</h2>

          <span>{completionRate}%</span>

        </div>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${completionRate}%`,
            }}
          ></div>

        </div>

        <p className="progress-text">
          {stats.completed} of {stats.tasks} tasks
          completed
        </p>

      </div>

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onProjectCreated={loadDashboard}
      />

    </div>
  );
}

export default Dashboard;