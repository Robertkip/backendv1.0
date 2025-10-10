import dotenv from "dotenv";
import cookieSession from "cookie-session";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import fs from "fs";
import path from "path";
import url from "url";
import http from "http";
import { Server as Socket } from "socket.io";
import grpc from '@grpc/grpc-js';
import RedisStore from "connect-redis";
import { ReflectionService } from '@grpc/reflection';
import { createClient } from "redis";
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
import protoLoader from '@grpc/proto-loader';
import session from "express-session";
import { detectDevice } from "./src/middlewares/authorizationPermission.js";
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
import propertyRouter from "./src/routers/propertyRoute.js";
import ratingRouter from "./src/routers/ratingRoute.js";
import geoLocationRouter from "./src/routers/geoLocationRoute.js";
import { initPassport } from "./src/middlewares/initPassport.js";
import notificationRouter from "./src/routers/notifyRoute.js";
import User from "./src/models/authModel.js";
import { createPost, getTimeline } from "./src/controllers/postController.js";
import Message from "./src/models/messageModel.js";
import resolvers from "./src/resolvers/index.js";
import typeDefs from "./src/graphqlschema/index.js";
import connectSocket from "./src/socket/ConnectSocket.js";
import { Authenticated } from "./src/middlewares/authorizationPermission.js";
import connectDB from "./src/config/connectMongo.js";


import { runMigrations } from "./src/config/connectDb.js";

import options from "./swagger-output.json" assert { type: "json" };


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const PROTO_PATH = path.join(__dirname, "./proto/post.proto");

dotenv.config();

const app = express();

connectDB();


app.use(cors());

app.use(express.json());


app.use('/graphql', graphqlUploadExpress());


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      user: req.user,
    };
  },
});

await server.start();
server.applyMiddleware({ app });

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


const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const postProto = grpc.loadPackageDefinition(packageDefinition).post;

const grpcserver = new grpc.Server();


grpcserver.addService(postProto.PostService.service, {
  CreatePost: async (call, callback) => {
    try {
      const { userId, content, media } = call.request;
      const result = await createPost({ userId, content, media });
      callback(null, { postId: result.postId });
    } catch (error) {
      callback(error);
    }
  },
  GetTimeline: async (call, callback) => {
    try {
      const { userId } = call.request;
      const result = await getTimeline({ userId });
      callback(null, { posts: result.posts });
    } catch (error) {
      callback(error);
    }
  },
});

const GRPC_PORT = process.env.GRPC_PORT || 50051;
grpcserver.bindAsync(
  `0.0.0.0:${GRPC_PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('gRPC bind error:', error);
      return;
    }
    console.log(`gRPC server listening on port ${port}`);
    grpcserver.start();
  }
);

const reflection = new ReflectionService(postProto);
reflection.addToServer(grpcserver);


app.use(
  cookieSession({
    name: "session",
    keys: ["waridi"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(detectDevice);  
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
app.use("/api/v1", propertyRouter);
app.use("/api/v1", geoLocationRouter);


const httpServer = http.createServer(app);

connectSocket(httpServer);

const startServer = async () => {
  try {

    await runMigrations();
  app.listen(PORT,  () => {

    console.log(`Server is running on port`);
  });

}  catch (error) {
  console.error('Server startup failed:', error);
  process.exit(1);
}

}
  io.listen(8085);


startServer();


global.ononline = new Map();

export default app;
