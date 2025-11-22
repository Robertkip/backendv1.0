// socket/connectSocket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import UserProfile from "../models/userProfileModel.js";
import MessageSchema from "../mongomodel/messageSchema.js";

const onlineUsers = new Map(); // socket.id -> { userId, username, userProfile }

const getRoomCode = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

function connectSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 100 * 1024 * 1024,
  });

 // socket/connectSocket.js
io.use(async (socket, next) => {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")?.[1] ||
      socket.handshake.query?.token;

    if (!token) {
      console.log("No token provided");
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const profile = await UserProfile.findOne({
        where: { userId: decoded.id },
        attributes: ["id", "user_fname", "user_lname", "user_avatar"],
      });

      if (!profile) return next(new Error("Profile not found"));

      socket.user = {
        id: decoded.id,
        profileId: profile.id,
        name: `${profile.user_fname || ""} ${profile.user_lname || ""}`.trim() || decoded.username,
        avatar: profile.user_avatar,
      };

      console.log(`Authenticated socket: ${socket.user.name} (${socket.user.id})`);
      next();
    } catch (err) {
      console.log("JWT Error:", err.message);
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (ID: ${socket.user.id})`);

    // Add to online users
    onlineUsers.set(socket.id, {
      userId: socket.user.id,
      profileId: socket.user.profileId,
      name: socket.user.name,
      avatar: socket.user.avatar,
      socketId: socket.id,
    });

    // Send online status to friends (optional later)
    socket.emit("me_online", { userId: socket.user.id });

    // Join private room with self
    socket.join(socket.user.id);

    // === PRIVATE MESSAGE ===
    socket.on("send_private_message", async (data) => {
      const { receiverId, message, fileUrl, type = "text" } = data;

      if (!receiverId || receiverId === socket.user.id) {
        return socket.emit("error", { msg: "Invalid receiver" });
      }

      const roomCode = getRoomCode(socket.user.id, receiverId);

      const msg = await MessageSchema.create({
        roomCode,
        senderId: socket.user.id,
        receiverId,
        senderName: socket.user.name,
        message: message || null,
        fileUrl: fileUrl || null,
        type,
      });

      const messagePayload = {
        _id: msg._id,
        roomCode,
        senderId: socket.user.id,
        senderName: socket.user.name,
        receiverId,
        message: message || null,
        fileUrl: fileUrl || null,
        type,
        createdAt: msg.createdAt,
      };

      // Send to receiver if online
      const receiverSockets = [...onlineUsers.entries()]
        .filter(([_, user]) => user.userId === receiverId)
        .map(([socketId]) => socketId);

      if (receiverSockets.length > 0) {
        io.to(receiverSockets).emit("receive_private_message", messagePayload);
      }

      // Always send back to sender (for UI consistency)
      socket.emit("receive_private_message", messagePayload);
    });

    // === TYPING EVENTS ===
    socket.on("typing_start", ({ receiverId }) => {
      const roomCode = getRoomCode(socket.user.id, receiverId);
      socket.to(receiverId).emit("user_typing", {
        senderId: socket.user.id,
        senderName: socket.user.name,
      });
    });

    socket.on("typing_stop", ({ receiverId }) => {
      socket.to(receiverId).emit("user_stopped_typing", {
        senderId: socket.user.id,
      });
    });

    // === GET ONLINE STATUS OF A USER ===
    socket.on("check_user_online", (targetUserId) => {
      const isOnline = [...onlineUsers.values()].some(u => u.userId === targetUserId);
      socket.emit("user_online_status", { userId: targetUserId, online: isOnline });
    });

    // === DISCONNECT ===
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
      onlineUsers.delete(socket.id);

      // Notify friends they're offline (optional)
      socket.broadcast.emit("user_offline", { userId: socket.user.id });
    });
  });

  return io;
}

export default connectSocket;
