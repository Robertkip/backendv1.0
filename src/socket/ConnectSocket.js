import { Server } from "socket.io";
import { onJoinRoomEvent, onGetRoomUsersEvent } from "./SocketEvent.js";
import fileUpload from "../helpers/FileUpload.js";
import deleteScheduler from "../helpers/DeleteScheduler.js";
import MessageSchema from "../mongomodel/messageSchema.js";
function connectSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 100 * 1024 * 1024, // 100 MB
  });

  io.on("connection", (socket) => {
    console.log(`A user connected having ID : ${socket.id}`);

    // JOINING THE ROOM
    socket.on("joinRoomEvent", (data) => {
      onJoinRoomEvent(data, socket, io);
    });

    // MESSAGE
    socket.on("sendMessageEvent", async (data) => {
      try {
        await MessageSchema.create({
          roomCode: data.ROOM_CODE,
          senderId: socket.data.USER_ID,  
          senderName: socket.data.USER_NAME,
          receiverId: data.RECEIVER_ID || null,
          type: data.TYPE,
          message: data.MESSAGE || null,
          fileUrl: data.FILE_URL || null,
        });

        // ✅ Broadcast to other users in the room
        socket.to(data.ROOM_CODE).emit("receiveMessageEvent", msg);
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("errorEvent", "Failed to save message.");
      }
    });

    // ROOM USER DETAILS
    socket.on("getRoomUsersEvent", (data) => {
      const roomUsers = onGetRoomUsersEvent(data, io);
      socket.emit("receiveRoomUsersEvent", roomUsers);
    });

    // START TYPING EVENT
    socket.on("sendStartTypingEvent", (data) => {
      socket.to(data.ROOM_CODE).emit("getStartTypingEvent", data);
    });

    // STOP TYPING EVENT
    socket.on("sendStopTypingEvent", (data) => {
      socket.to(data.ROOM_CODE).emit("getStopTypingEvent", data);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("A user disconnected having ID:", socket.id);
    });
  });

  console.log("✅ Socket.IO initialized and listening.");
}

export default connectSocket;
