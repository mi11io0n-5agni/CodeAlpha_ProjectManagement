const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("joinProject", (projectId) => {
      socket.join(projectId);
      console.log(`Joined Project: ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};

export default setupSocket;