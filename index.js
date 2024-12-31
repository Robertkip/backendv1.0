import dotenv from "dotenv";
import cookieSession from "cookie-session";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import path from "path";
import url from "url";
import fs from "fs";
import { Server as Socket } from "socket.io";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import session from "express-session";
import passport from "passport";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import apartmentRouter from "./src/routers/apartmentRoute.js";
import authRouter from "./src/routers/authRoute.js";
import roleRouter from "./src/routers/roleRoute.js";
import marketRouter from "./src/routers/marketRoute.js";
import landlordRouter from "./src/routers/landlordRoute.js";
import tenantRouter from "./src/routers/tenantRoute.js";
import agentRouter from "./src/routers/agentRoute.js";
import cartRouter from "./src/routers/cartRoute.js";
import userProfileRouter from "./src/routers/userProfileRoute.js";
import friendRequestRouter from "./src/routers/friendrequestRouter.js";
import notificationDeviceRouter from "./src/routers/notificationTokenRoute.js";
import messageRouter from "./src/routers/messageRouter.js";
import ratingRouter from "./src/routers/ratingRoute.js";
import geoLocationRouter from "./src/routers/geoLocationRoute.js";
import { initPassport } from "./src/middlewares/initPassport.js";
import notificationRouter from "./src/routers/notifyRoute.js";
import User from "./src/models/authModel.js";
import Message from "./src/models/messageModel.js";
import {
  getUser,
  addNewUser,
  removeUser,
} from "./src/controllers/notifyController.js";

import options from "./swagger-output.json" assert { type: "json" };

dotenv.config();

const app = express();


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

global.__basedir = __dirname;

console.log(__basedir);

const specs = {
  customCss: fs.readFileSync("./swagger.css", "utf-8"),
};

// const spec = swaggerJSDoc(options);

// const Roles = db.roles;
const PORT = process.env.PORT || 8084;

//passportSetup(app);

let io = new Socket({
  cors: {
    origin: "*",
  },
});
const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "waridi",
});

const REDIS_SESSION_SECRET = process.env.REDIS_SESSION_SECRET;

app.use(
  cookieSession({
    name: "session",
    keys: ["waridi"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(cors({ origin: "*" }));

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
app.use(logger("common")); include: [
  {
    model: User,
    as: "sender",
    attributes: ["_id", "name"],
  },
],

initPassport(app);

app.use(
  session({
    store: redisStore,
    secret: REDIS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 10,
    },
  })
);

app.use("/images", express.static("Images"));
app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(options));

app.use("/api/v1", apartmentRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", roleRouter);
app.use("/api/v1", landlordRouter);
app.use("/api/v1", tenantRouter);
app.use("/api/v1", agentRouter);
app.use("/api/v1", marketRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1/user", userProfileRouter);
app.use("/api/v1", friendRequestRouter);
app.use("/api/v1/token", notificationDeviceRouter);
app.use("/api/v1", ratingRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1", geoLocationRouter);
// const server =  app.listen(PORT, ADDRESS, () => {
//     console.log(`Server is running on port`)
// })

let users = [];

io.on("connection", (socket) => { 
  console.log('User connected', socket.id);
  socket.on('addUser', userId => {
      const isUserExist = users.find(user => user.userId === userId);
      if (!isUserExist) {
          const user = { userId, socketId: socket.id };
          users.push(user);
          io.emit('getUsers', users);
      }
 })
 socket.on('sendMessage', async ({senderId, receiverId, message}) => {
  const receiver = users.find(user => user.userId === receiverId);
  const sender = users.find(user => user.userId === senderId);

  const user = await User.findByPk(senderId);

  console.log('sender :>> ', sender, receiver);

  if (receiver) {
     io.to(receiver.socketId).emit('getMessage', {
         senderId,
         message,
         receiverId,
     });

     io.to(sender.socketId).emit('getMessage', {
         senderId,
         message,
         receiverId,
     });
  } else {
     io.to(sender.socketId).emit('getMessage', {
         senderId,
         message,
         receiverId,
     });
  }
});

 socket.on('disconnect', () => {
  users = users.filter(user => user.socketId !== socket.id);
  io.emit('getUsers', users);
});

})


io.on("connection", (socket) => {
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });
  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
    io.to(receiver.socketId).emit("getNotification", {
      senderName,
      type,
    });
  });
  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    io.to(receiver.socketId).emit("getText", {
      senderName,
      text,
    });
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});


app.post("/api/v1/send-message", async (req, res) => {
  const { senderId, receiverId, message } = req.body;


  // Emit the message through Socket.IO
  io.emit('sendMessage', { senderId, receiverId, message });

  try {

    await Message.create({senderId, message, receiverId}); 

    return res.status(200).json({message: "Message sent successfully"});

    } catch (error) {
        return res.status(500).json({message: error.message}); 
    }


})

  app.listen(PORT,  () => {
    console.log(`Server is running on port`);
  });
    // io = new Socket(server, {
    // cors: {
    //   origin: "http://localhost:8084",
    // },
  // }
  // );
  // io.listen(8086);


// if (process.env.NODE_ENV === "development") {
//   let ADDRESS = "192.168.0.12";
//   const server = app.listen(PORT, ADDRESS, () => {
//     console.log(`Server is running on port`);
//   });
//   const io = new Socket(server, {
//     cors: {
//       origin: "http://192.168.0.12:8084",
//     },
//   });
// } else if (process.env.NODE_ENV === "production") {
//   let ADDRESS = "38.242.239.1";
//   const server = app.listen(PORT, ADDRESS, () => {
//     console.log(`Server is running on port`);
//   });
  
  io.listen(8085);
// } else {
//   let ADDRESS = "192.168.0.12";
//   const server = app.listen(PORT, ADDRESS, () => {
//     console.log(`Server is running on port`);
//   });
//   const io = new Socket(server, {
//     cors: {
//       origin: "http://192.168.0.12:8084",
//     },
//   });
// }

global.ononline = new Map();

export default app;
