import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔹 Connect to Database
connectDB();

// 🔹 Allowed Origins (Frontend URLs)
const allowedOrigins = [
  "http://localhost:3000", // local frontend
  "https://project-management-system-sand.vercel.app/" // 🔁 replace with your Vercel URL
];

// 🔹 Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// 🔹 Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// 🔹 Routes
app.use("/api/auth", (await import("./routes/auth.routes.js")).default);
app.use("/api/projects", (await import("./routes/project.routes.js")).default);
app.use("/api/tasks", (await import("./routes/task.routes.js")).default);
app.use("/api/users", (await import("./routes/user.routes.js")).default);

// 🔹 Health check route
app.get("/", (req, res) => {
  res.send("🚀 PMS API Running...");
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
