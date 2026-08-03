import API from "./api";

// Get all tasks of a project
export const getProjectTasks = async (projectId) => {
  const { data } = await API.get(`/tasks/project/${projectId}`);
  return data;
};

// Create task
export const createTask = async (taskData) => {
  const { data } = await API.post("/tasks", taskData);
  return data;
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  const { data } = await API.put(`/tasks/${taskId}`, {
    status,
  });

  return data;
};