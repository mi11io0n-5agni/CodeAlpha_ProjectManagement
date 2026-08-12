import jwt from "jsonwebtoken";
import User from "../models/User.js";

const setupSocket = (io) => {
  // Authenticate every Socket.io connection using the same JWT
  // used by the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      // Store authenticated user on socket
      socket.user = user;

      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    console.log(`User connected: ${socket.id} (${socket.user.name})`);

    // Every connected user gets their own private room.
    socket.join(`user:${userId}`);

    console.log(`Joined personal room: user:${userId}`);

    // Project room
    socket.on("joinProject", (projectId) => {
      if (!projectId) return;

      socket.join(projectId.toString());

      console.log(
        `${socket.user.name} joined project room: ${projectId}`
      );
    });

    // Leave project room
    socket.on("leaveProject", (projectId) => {
      if (!projectId) return;

      socket.leave(projectId.toString());

      console.log(
        `${socket.user.name} left project room: ${projectId}`
      );
    });

    socket.on("disconnect", () => {
      console.log(
        `User disconnected: ${socket.id} (${socket.user.name})`
      );
    });
  });
};

export default setupSocket;