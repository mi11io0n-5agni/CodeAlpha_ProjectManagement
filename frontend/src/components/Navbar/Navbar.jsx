import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="navbar-left">
        <h2>Dashboard</h2>
      </div>

      <div className="navbar-right">

        <input
          type="text"
          placeholder="Search..."
          className="search-box"
        />

        <div className="user-avatar">
          M
        </div>

      </div>

    </header>
  );
}

export default Navbar;