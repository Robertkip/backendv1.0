import { Socket, Server } from "socket.io";
import { onJoinRoomEvent, onGetRoomUsersEvent } from "./SocketEvent";
import fileUpload from "../helpers/FileUpload";
import deleteScheduler from "../helpers/DeleteScheduler";

function connectSocket(server){
  cors: {
    origin: '*'
  }
}

export default connectSocket;

