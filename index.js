import cookieSession from "cookie-session";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import path from "path";
import url from "url";
import fs from "fs";
import { Server as Socket } from "socket.io";
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
import options from "./swagger-output.json" assert { type: "json" };
import { initPassport } from "./src/middlewares/initPassport.js";

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

initPassport(app);

app.use(
  cookieSession({
    name: "session",
    keys: ["waridi"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(cors());


app.use(express.json());
app.use(helmet());
app.use(logger("common"));

app.use(passport.initialize());
app.use(passport.session());
app.use("/images", express.static("Images"));
app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(options));

app.use("/api/v1", apartmentRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", roleRouter);
app.use("/api/v1", marketRouter);
app.use("/api/v1", landlordRouter);
app.use("/api/v1", tenantRouter);
app.use("/api/v1", agentRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1/user", userProfileRouter);
app.use("/api/v1", friendRequestRouter);
app.use("/api/v1/token", notificationDeviceRouter);
app.use("/api/v1", ratingRouter);
// const server =  app.listen(PORT, ADDRESS, () => {
//     console.log(`Server is running on port`)
// })

if (process.env.NODE_ENV === "development") {
  let ADDRESS = "192.168.1.76";
  const server = app.listen(PORT, ADDRESS, () => {
    console.log(`Server is running on port`);
  });
  const io = new Socket(server, {
    cors: {
      origin: "http://192.168.1.76:8084",
    },
  });
} else if (process.env.NODE_ENV === "production") {
  let ADDRESS = "38.242.239.1";
  const server = app.listen(PORT,ADDRESS, () => {
    console.log(`Server is running on port`);
  });
  const io = new Socket(server, {
    cors: {
      origin: "http://38.242.239.1:8084",
    },
  });
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
