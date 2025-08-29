import { Server } from "socket.io";
import fileUpload from "../helpers/FileUpload";
import deleteScheduler from "../helpers/DeleteScheduler";
const { onJoinRoomEvent, onGetRoomUsersEvent } = require("./SocketEvents");

// Keep a global map: USER_ID → socketId
const userSocketMap = new Map();

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
    console.log(`A user connected with socket ID: ${socket.id}`);

    // JOIN ROOM
    socket.on("joinRoomEvent", (data) => {
      onJoinRoomEvent(data, socket, io, userSocketMap);
    });

    // MESSAGE (Group or Direct)
    socket.on("sendMessageEvent", (data) => {
      // Auto-tag message with sender info
      const enrichedData = {
        ...data,
        SENDER_ID: socket.data.USER_ID,
        SENDER_NAME: socket.data.USER_NAME,
        TIMESTAMP: new Date().toISOString(),
      };

      if (data.TYPE === "MESSAGE") {
        if (data.IS_DIRECT) {
          // Direct Chat
          const targetSocketId = userSocketMap.get(data.TARGET_USER_ID);
          if (targetSocketId) {
            io.to(targetSocketId).emit("receiveMessageEvent", enrichedData);
            socket.emit("receiveMessageEvent", enrichedData); // echo back to sender
          } else {
            socket.emit("errorEvent", `User ${data.TARGET_USER_ID} is offline`);
          }
        } else {
          // Group Chat
          socket.to(data.ROOM_CODE).emit("receiveMessageEvent", enrichedData);
          socket.emit("receiveMessageEvent", enrichedData); // echo back
        }
      } else {
        // File Upload Handling
        fileUpload(data);
        deleteScheduler(data);

        if (data.IS_DIRECT) {
          const targetSocketId = userSocketMap.get(data.TARGET_USER_ID);
          if (targetSocketId) {
            io.to(targetSocketId).emit("receiveMessageEvent", enrichedData);
            socket.emit("receiveMessageEvent", enrichedData);
          }
        } else {
          socket.to(data.ROOM_CODE).emit("receiveMessageEvent", enrichedData);
          socket.emit("receiveMessageEvent", enrichedData);
        }
      }
    });

    // ROOM USER DETAILS
    socket.on("getRoomUsersEvent", (data) => {
      const roomUsers = onGetRoomUsersEvent(data, io);
      socket.emit("receiveRoomUsersEvent", roomUsers);
    });

    // TYPING EVENTS
    socket.on("sendStartTypingEvent", (data) => {
      socket.to(data.ROOM_CODE).emit("getStartTypingEvent", {
        ...data,
        USER_ID: socket.data.USER_ID,
        USER_NAME: socket.data.USER_NAME,
      });
    });

    socket.on("sendStopTypingEvent", (data) => {
      socket.to(data.ROOM_CODE).emit("getStopTypingEvent", {
        ...data,
        USER_ID: socket.data.USER_ID,
        USER_NAME: socket.data.USER_NAME,
      });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.data.USER_ID) {
        userSocketMap.delete(socket.data.USER_ID);
      }
    });
  });

  return io;
}

export default connectSocket;
