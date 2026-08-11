import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Register User
export const register = async (userData) => {
  const { data } = await API.post("/register", userData);
  return data;
};

// Login User
export const login = async (userData) => {
  const { data } = await API.post("/login", userData);
  return data;
};

// Get current profile
export const getProfile = async () => {
  const { data } = await API.get("/profile");
  return data;
};

// Update profile
export const updateProfile = async (profileData) => {
  const { data } = await API.put("/profile", profileData);
  return data;
};

// Change password
export const changePassword = async (passwordData) => {
  const { data } = await API.put(
    "/profile/password",
    passwordData
  );
  return data;
};