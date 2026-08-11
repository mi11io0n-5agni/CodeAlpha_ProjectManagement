import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Projects from "./pages/Projects/Projects";
import ProjectDetails from "./pages/ProjectDetails/ProjectDetails";
import TaskDetails from "./pages/TaskDetails/TaskDetails";
import Profile from "./pages/Profile/Profile";
import MainLayout from "./layouts/MainLayout/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout */}

        <Route element={<MainLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route
            path="/projects/:projectId"
            element={<ProjectDetails />}
          />

          <Route path="/tasks/:taskId" element={<TaskDetails />} />

          <Route path="/profile" element={<Profile />} />

        </Route>

        {/* 404 */}

        <Route
          path="*"
          element={
            <h1 style={{ textAlign: "center", marginTop: "100px" }}>
              404 | Page Not Found
            </h1>
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;