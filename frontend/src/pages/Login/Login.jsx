import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import { login } from "../../services/authService";
import { connectSocket } from "../../services/socket";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ------------------------------------------
  // Handle input changes
  // ------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------------
  // Handle login
  // ------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------
      // Login request
      // --------------------------------------

      const response = await login(form);

      // --------------------------------------
      // Save authentication data
      // --------------------------------------

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      // --------------------------------------
      // Connect authenticated socket
      // --------------------------------------

      connectSocket();

      // --------------------------------------
      // Redirect
      // --------------------------------------

      toast.success(
        "Logged in successfully."
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* ---------------------------------- */}
        {/* Header */}
        {/* ---------------------------------- */}

        <h1>TaskFlow</h1>

        <p>Sign in to continue.</p>

        {/* ---------------------------------- */}
        {/* Login form */}
        {/* ---------------------------------- */}

        <form onSubmit={handleSubmit}>
          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          {/* Password */}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        {/* ---------------------------------- */}
        {/* Register link */}
        {/* ---------------------------------- */}

        <p className="bottom-text">
          Don't have an account?
          <Link to="/register">
            {" "}
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;