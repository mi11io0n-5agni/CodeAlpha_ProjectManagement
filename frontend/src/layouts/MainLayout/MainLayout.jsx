import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import "./MainLayout.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on wider screens to ensure fixed desktop layout
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) setSidebarOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="layout">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`main-content ${sidebarOpen ? "drawer-open" : ""}`}>

        <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />

        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default MainLayout;