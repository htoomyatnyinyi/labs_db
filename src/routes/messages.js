import express from "express";
import { sql_db } from "../db/db.js";

const router = express.Router();
const setupSocketIo = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", (room) => {
      socket.join(room);
      socket.emit("joined_room", room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("send_message", (data) => {
      const { message, room } = data;
      io.to(room).emit("receive_message", { message });
      io.to(room).emit("notification", { message: `New message: ${message}` });
      console.log(`Message: ${message} sent to room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

router.post("/messages", (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  const query =
    "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
  sql_db.query(query, [sender_id, receiver_id, content], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.get("/messages/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = "SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ?";
  sql_db.query(query, [userId, userId], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

const messageRoute = (io) => {
  setupSocketIo(io);
  return router;
};

export default messageRoute;
