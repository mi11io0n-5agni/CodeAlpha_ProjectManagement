import API from "./api";

// Get all projects
export const getProjects = async () => {
  const { data } = await API.get("/projects");
  return data;
};

// Create project
export const createProject = async (projectData) => {
  const { data } = await API.post("/projects", projectData);
  return data;
};

// Get one project
export const getProject = async (projectId) => {
  const { data } = await API.get(`/projects/${projectId}`);
  return data;
};

// Update project
export const updateProject = async (projectId, projectData) => {
  const { data } = await API.put(`/projects/${projectId}`, projectData);
  return data;
};

// Delete project
export const deleteProject = async (projectId) => {
  const { data } = await API.delete(`/projects/${projectId}`);
  return data;
};
// Add member to project
export const addProjectMember = async (projectId, email) => {
  const { data } = await API.post(
    `/projects/${projectId}/members`,
    { email }
  );

  return data;
};