import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

app.get("/", (req, res) => {
  res.send("Hello From Signalling Server");
});

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);

  socket.on("create-meet", (callback) => {
    const meetId = Math.random().toString(36).substring(7);
    socket.join(meetId);
    callback({ meetId });
  });

  socket.on("signal", (meetId, message) => {
    socket.to(meetId).emit("signal", message);
  });

  socket.on("hang-up", (meetId) => {
    socket.to(meetId).emit("hang-up");
  });

  socket.on("join-meet", (meetId, callback) => {
    socket.join(meetId);
    callback({
      status: "success",
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3182;
server.listen(PORT, () => {
  console.log("server running on port", PORT);
});
