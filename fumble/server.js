import "dotenv/config";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { networkInterfaces } from "node:os";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Bind to all network interfaces
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_FILE = join(__dirname, "app/data/messages.json");
const USERS_FILE = join(__dirname, "app/data/users.json");
const SWIPES_FILE = join(__dirname, "app/data/swipes.json");

// Initialize Gemini API (optional - only if API key is provided)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Save messages to JSON file
function saveMessages(messages) {
  writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
}

// Load users data
let users = [];
try {
  const usersData = readFileSync(USERS_FILE, "utf-8");
  users = JSON.parse(usersData);
} catch (error) {
  console.error("Error loading users data:", error);
}

// Get user by ID
function getUserById(userId) {
  return users.find(u => u.id === parseInt(userId));
}

// Load swipes data
let swipes = {};
// RESET ON STARTUP: Write empty object to file
try {
  writeFileSync(SWIPES_FILE, JSON.stringify({}, null, 2), "utf-8");
} catch (error) {
  console.error("Error clearing swipes data:", error);
}

// Save swipes to JSON file
function saveSwipes(swipesData) {
  writeFileSync(SWIPES_FILE, JSON.stringify(swipesData, null, 2), "utf-8");
}

// Get conversation ID from two user IDs
function getConversationId(user1, user2) {
  const id1 = parseInt(user1);
  const id2 = parseInt(user2);
  return `${Math.min(id1, id2)}_${Math.max(id1, id2)}`;
}

// Rewrite message using Gemini based on user stereotype
async function rewriteMessageWithGemini(originalMessage, stereotype) {
  // If Gemini is not configured, return original message
  if (!genAI) {
    console.log("Gemini API not configured, using original message");
    return originalMessage;
  }

  try {
    const prompt = `You are helping a user in a dating app. The user has the stereotype: "${stereotype}".

Rewrite the following message to be extremely flirty, borderline unhinged, and completely unexpected. It should make the recipient take a step back because it feels so bold and out of place, while still maintaining the original meaning. Make it daring and provocative, leaning heavily into the persona.

Only reply with the modified message, do not provide any explanation. Do not provide more than one option, and do not surround the new message in quotations.

Original message: "${originalMessage}"

Rewritten message:`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const rewrittenMessage = response.text.trim();

    console.log(`Original: "${originalMessage}" -> Rewritten: "${rewrittenMessage}"`);
    return rewrittenMessage;
  } catch (error) {
    console.error("Error rewriting message with Gemini:", error);
    // Return original message if Gemini fails
    return originalMessage;
  }
}

// Start with empty messages (cleared on each server restart)
let messages = {};
// RESET ON STARTUP: Write empty object to file
try {
  writeFileSync(MESSAGES_FILE, JSON.stringify({}, null, 2), "utf-8");
} catch (error) {
  console.error("Error clearing messages data:", error);
}

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
      socket.userId = userId;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on("swipe", ({ to, direction }) => {
      const fromId = socket.userId;
      if (!fromId) return;

      console.log(`User ${fromId} swiped ${direction} on ${to}`);

      // Initialize user's swipes if not exist
      if (!swipes[fromId]) {
        swipes[fromId] = {};
      }

      // Record swipe
      swipes[fromId][to] = direction;
      saveSwipes(swipes);

      // Check for match if swiped right
      if (direction === "right") {
        const otherUserSwipes = swipes[to];
        if (otherUserSwipes && otherUserSwipes[fromId] === "right") {
          console.log(`MATCH! User ${fromId} and User ${to}`);

          // Notify both users of the match
          socket.emit("new_match", { with: to });

          const otherSocketId = userSockets.get(to);
          if (otherSocketId) {
            io.to(otherSocketId).emit("new_match", { with: fromId });
          }
        }
      }
    });

    socket.on("get_swipes", () => {
      const userSwipes = swipes[socket.userId] || {};
      socket.emit("swipes_history", Object.keys(userSwipes));
    });

    socket.on("get_matches", () => {
      const userId = socket.userId;
      if (!userId) return;

      const userSwipes = swipes[userId] || {};
      const matches = [];

      for (const [targetId, direction] of Object.entries(userSwipes)) {
        if (direction === "right") {
          // Check if they also swiped right on us
          const theirSwipes = swipes[targetId] || {};
          if (theirSwipes[userId] === "right") {
            const matchProfile = getUserById(targetId);
            if (matchProfile) {
              matches.push(matchProfile);
            }
          }
        }
      }

      socket.emit("matches_list", matches);
    });

    socket.on("send_message", async ({ to, message, tempId }) => {
      console.log(`Message from ${socket.userId} to ${to}:`, message);

      // Get sender's user data
      const sender = getUserById(socket.userId);
      let finalMessage = message;

      // Rewrite message using Gemini if user has a stereotype
      if (sender && sender.stereotype) {
        finalMessage = await rewriteMessageWithGemini(message, sender.stereotype);
      } else {
        console.log(`User ${socket.userId} has no stereotype, sending original message`);
      }

      const timestamp = Date.now();
      const messageId = timestamp;
      const conversationId = getConversationId(socket.userId, to);

      // Save message to persistent storage
      if (!messages[conversationId]) {
        messages[conversationId] = [];
      }

      const messageObj = {
        id: messageId,
        from: socket.userId,
        to: to,
        text: finalMessage,
        timestamp: timestamp
      };

      messages[conversationId].push(messageObj);
      saveMessages(messages);

      // Send to recipient
      const recipientSocketId = userSockets.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", {
          from: socket.userId,
          message: finalMessage,
          timestamp: timestamp,
          id: messageId
        });
      }

      // Confirm to sender
      socket.emit("message_sent", {
        id: messageId,
        tempId: tempId,
        timestamp: timestamp
      });
    });

    socket.on("get_messages", ({ otherUserId }) => {
      const conversationId = getConversationId(socket.userId, otherUserId);
      const history = messages[conversationId] || [];
      socket.emit("messages_history", history);
    });

    socket.on("get_all_last_messages", () => {
      const lastMessages = {};

      for (const [conversationId, msgs] of Object.entries(messages)) {
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          lastMessages[conversationId] = {
            text: lastMsg.text,
            timestamp: lastMsg.timestamp
          };
        }
      }

      socket.emit("all_last_messages", lastMessages);
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
