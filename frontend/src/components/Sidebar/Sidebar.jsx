import {
  Dashboard,
  Folder,
  Assignment,
  People,
  Person,
  Logout,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TaskFlow</h2>
      </div>

      <nav className="sidebar-menu">

        <NavLink to="/dashboard" className="menu-item">
          <Dashboard />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/projects" className="menu-item">
          <Folder />
          <span>Projects</span>
        </NavLink>

        <NavLink to="/tasks" className="menu-item">
          <Assignment />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/members" className="menu-item">
          <People />
          <span>Members</span>
        </NavLink>

        <NavLink to="/profile" className="menu-item">
          <Person />
          <span>Profile</span>
        </NavLink>

      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <Logout />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;