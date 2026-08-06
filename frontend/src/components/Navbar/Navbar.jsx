import "./Navbar.css";

function Navbar({ onToggleSidebar = () => {} }) {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "User" };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="hamburger"
          aria-label="Open sidebar"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        <div className="page-title">
          <h2>Dashboard</h2>
          <p className="welcome">Welcome back, <strong>{user.name.split(" ")[0]}</strong></p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="search">
          <input
            type="search"
            placeholder="Search tasks, projects..."
            aria-label="Search"
          />
        </div>

        <button className="notification-btn" aria-label="Notifications">
          🔔
          <span className="pulse" aria-hidden></span>
        </button>

        <div className="user-info" tabIndex={0} aria-label={`User menu for ${user.name}`}>
          <div className="avatar" aria-hidden>
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="user-meta">
            <h4>{user.name}</h4>
            <span>Welcome Back</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;