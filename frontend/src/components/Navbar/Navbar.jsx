import "./Navbar.css";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>Dashboard</h2>
      </div>

      <div className="navbar-right">
        <button className="notification-btn">
          🔔
        </button>

        <div className="user-info">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h4>{user.name}</h4>
            <span>Welcome Back</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;