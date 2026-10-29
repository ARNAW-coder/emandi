import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" }, // fine for local dev/demo; tighten before real deployment
  });

  io.on("connection", (socket) => {
    socket.on("join:schedule", (scheduleId) => {
      socket.join(`schedule:${scheduleId}`);
    });

    socket.on("leave:schedule", (scheduleId) => {
      socket.leave(`schedule:${scheduleId}`);
    });

    socket.on("join:user", (userId) => {
  socket.join(`user:${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized yet");
  return io;
};