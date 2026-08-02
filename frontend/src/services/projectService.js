import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getProjects = async () => {
  const { data } = await API.get("/projects");
  return data;
};

export const createProject = async (project) => {
  const { data } = await API.post("/projects", project);
  return data;
};

export default API;