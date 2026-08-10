import API from "./api";

// Get all comments for a task
export const getComments = async (taskId) => {
  const { data } = await API.get(
    `/comments/${taskId}`
  );

  return data;
};

// Add a comment to a task
export const addComment = async (taskId, text) => {
  const { data } = await API.post(
    "/comments",
    {
      taskId,
      text,
    }
  );

  return data;
};