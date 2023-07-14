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
import ratingRouter from "./src/routers/ratingRoute.js";
import { initPassport } from "./src/middlewares/initPassport.js";
import notificationRouter from "./src/routers/notifyRoute.js";
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

const io = new Socket({
  cors: {
    origin: "https://api.waridi.co/api/v1/",
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

app.use(cors());

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
app.use(logger("common"));

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
// const server =  app.listen(PORT, ADDRESS, () => {
//     console.log(`Server is running on port`)
// })

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

if (process.env.NODE_ENV === "development") {
  let ADDRESS = "192.168.0.28";
  const server = app.listen(PORT, ADDRESS, () => {
    console.log(`Server is running on port`);
  });
  const io = new Socket(server, {
    cors: {
      origin: "http://192.168.0.28:8084",
    },
  });
} else if (process.env.NODE_ENV === "production") {
  let ADDRESS = "38.242.239.1";
  const server = app.listen(PORT, ADDRESS, () => {
    console.log(`Server is running on port`);
  });
  const io = new Socket(server, {
    cors: {
      origin: "http://38.242.239.1:8084",
    },
  });
  io.listen(8084);
} else {
  let ADDRESS = "192.168.239.1";
  const server = app.listen(PORT, ADDRESS, () => {
    console.log(`Server is running on port`);
  });
  const io = new Socket(server, {
    cors: {
      origin: "http://localhost:8084",
    },
  });
}

global.ononline = new Map();

export default app;
