import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { networkInterfaces } from "node:os";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Bind to all network interfaces
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Helper to get local IP address
function getLocalIpAddress() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  const userSockets = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on("send_message", ({ to, message }) => {
      console.log(`Message from ${socket.userId} to ${to}:`, message);
      const recipientSocketId = userSockets.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", {
          from: socket.userId,
          message,
          timestamp: Date.now()
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
        userSockets.delete(socket.userId);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      const localIp = getLocalIpAddress();
      console.log(`\n> Ready on:`);
      console.log(`  - Local:   http://localhost:${port}`);
      console.log(`  - Network: http://${localIp}:${port}\n`);
      console.log(`> To access from other devices on your network, use the Network URL\n`);
    });
});
