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