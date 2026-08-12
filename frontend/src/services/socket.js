import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

// Create socket connection
export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("Socket connection skipped: no token.");
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error(
        "🔴 Socket connection error:",
        error.message
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Socket disconnected:",
        reason
      );
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

// Get existing socket
export const getSocket = () => {
  return socket;
};

// Default export for Board.jsx
export default {
  on: (...args) => socket?.on(...args),
  off: (...args) => socket?.off(...args),
  emit: (...args) => socket?.emit(...args),

  get connected() {
    return socket?.connected || false;
  },

  get id() {
    return socket?.id;
  },
};