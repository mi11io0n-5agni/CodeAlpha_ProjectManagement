import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Sidebar.css";

function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    // close mobile drawer
    onClose();
  };

  // close on navigation for mobile: listen to route changes implicitly via effect cleanup
  useEffect(() => {
    // nothing to subscribe; keep hook so future enhancements can add listeners
    return () => {};
  }, []);

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/projects", label: "Projects", icon: "📁" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className={`sidebar ${open ? "open" : ""}`} aria-hidden={!open && window.innerWidth < 992}>
      <div className="sidebar-inner">
        <div className="sidebar-logo" role="banner">
          <div className="logo-mark">TF</div>
          <div className="logo-text">TaskFlow</div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => {
                // auto-close on small screens
                if (window.innerWidth < 768) onClose();
              }}
            >
              <span className="link-icon" aria-hidden>
                {it.icon}
              </span>
              <span className="link-label">{it.label}</span>
              <span className="active-indicator" aria-hidden />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={logout}
            aria-label="Logout"
          >
            <span className="logout-icon">🔒</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;