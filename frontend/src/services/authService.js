import api from "./api";

// Register User
export const register = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

// Login User
export const login = async (userData) => {
  const { data } = await api.post("/auth/login", userData);
  return data;
};

// Get current profile
export const getProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};

// Update profile
export const updateProfile = async (profileData) => {
  const { data } = await api.put("/auth/profile", profileData);
  return data;
};

// Change password
export const changePassword = async (passwordData) => {
  const { data } = await api.put(
    "/auth/profile/password",
    passwordData
  );
  return data;
};