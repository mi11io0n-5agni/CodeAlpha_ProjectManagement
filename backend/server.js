import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});