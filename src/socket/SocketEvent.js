function onJoinRoomEvent(data, socket, io, userSocketMap) {
  socket.data.USER_NAME = data.USER_NAME;
  socket.data.USER_ID = data.USER_ID;

  // Save mapping (userId → socketId) for direct messages
  userSocketMap.set(socket.data.USER_ID, socket.id);

  if (data.IS_NEW_ROOM) {
    socket.join(data.ROOM_CODE);
    socket.emit("toastEvent", `Welcome to Chit Chat ${data.USER_NAME}!`);
  } else {
    const roomExists =
      io.of("/").adapter.rooms && io.of("/").adapter.rooms.has(data.ROOM_CODE);

    if (roomExists) {
      socket.join(data.ROOM_CODE);

      socket.to(data.ROOM_CODE).emit("toastEvent", `${data.USER_NAME} has joined the Room`);

      let roomUsers = onGetRoomUsersEvent(data, io);
      socket.to(data.ROOM_CODE).emit("receiveRoomUsersEvent", roomUsers);

      socket.emit("toastEvent", `Welcome to Chit Chat ${data.USER_NAME}!`);

      socket.on("disconnecting", () => {
        const disconnectedUser = roomUsers.find(
          (user) => user[1] === socket.data.USER_ID
        );
        if (disconnectedUser) {
          socket.to(data.ROOM_CODE).emit("toastEvent", `${socket.data.USER_NAME} has left the Room`);
        }

        roomUsers = onGetRoomUsersEvent(data, io, socket.data.USER_ID);
        socket.to(data.ROOM_CODE).emit("receiveRoomUsersEvent", roomUsers);

        // Remove from userSocketMap
        userSocketMap.delete(socket.data.USER_ID);
      });
    } else {
      socket.emit("errorEvent", `No room found with code: ${data.ROOM_CODE}`);
    }
  }
}

function onGetRoomUsersEvent(data, io, excludeUserId = null) {
  const room = io.sockets.adapter.rooms.get(data.ROOM_CODE);
  if (room) {
    const users = [];
    room.forEach((socketId) => {
      const socket = io.sockets.sockets.get(socketId);
      if (
        socket &&
        socket.data &&
        socket.data.USER_NAME &&
        socket.data.USER_ID &&
        socket.data.USER_ID !== excludeUserId
      ) {
        users.push([socket.data.USER_NAME, socket.data.USER_ID]);
      }
    });
    return users;
  }
  return [];
}

export { onJoinRoomEvent, onGetRoomUsersEvent };
