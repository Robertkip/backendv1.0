import dotenv from "dotenv";
import cookieSession from "cookie-session";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import fs from "fs";
import path from "path";
import url, {fileURLToPath} from "url";
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
// import agentRouter from "./src/routers/agentRoute.js";
import cartRouter from "./src/routers/cartRoute.js";
import userProfileRouter from "./src/routers/userProfileRoute.js";
import friendRequestRouter from "./src/routers/friendrequestRouter.js";
import notificationDeviceRouter from "./src/routers/notificationTokenRoute.js";
import messageRouter from "./src/routers/messageRouter.js";
import propertyRouter from "./src/routers/propertyRoute.js";
import ratingRouter from "./src/routers/ratingRoute.js";
import geoLocationRouter from "./src/routers/geoLocationRoute.js";
import apartmentFilesRouter from "./src/routers/apartmentFilesRoute.js"
import apartmentPropertiesRouter from "./src/routers/apartmentPropertiesRoute.js"
import facilitiesRouter from "./src/routers/facilitiesRoute.js"
import propertyFacilitiesRouter from "./src/routers/propertyFacilitiesRoute.js"
import propertyFilesRouter from "./src/routers/propertyFilesRoute.js"
import propertyLocationRouter from "./src/routers/propertyLocationRoute.js"
import apartmentLocationRouter from "./src/routers/locationRoute.js";
import propertyPropertiesRouter from "./src/routers/propertyPropertiesRoute.js";
import apartmentVerifyRouter from "./src/routers/apartmentVerifyRoute.js";
import postMediaRouter from "./src/routers/postMediaRouter.js";
import { initPassport } from "./src/middlewares/initPassport.js";
import notificationRouter from "./src/routers/notifyRoute.js";
import rentPricingRouter from "./src/routers/rentalPriceRoute.js";
import User from "./src/models/authModel.js";
import { createPost, getTimeline } from "./src/controllers/postController.js";
import Message from "./src/models/messageModel.js";
import RentPricing from "./src/models/rentalPriceModel.js";
import { sequelize } from "./src/config/connectDb.js";
import resolvers from "./src/resolvers/index.js";
import typeDefs from "./src/graphqlschema/index.js";
import connectSocket from "./src/socket/ConnectSocket.js";
import { Authenticated } from "./src/middlewares/authorizationPermission.js";
import connectDB from "./src/config/connectMongo.js";
import { runMigrations } from "./src/config/connectDb.js";
import options from "./swagger-output.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../"); // adjust if server.js is in src/
const uploadDir = path.join(projectRoot, "Images");

const PROTO_PATH = path.join(__dirname, "./proto/post.proto");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: false,
  context: ({ req }) => ({
    user: req.user,
    roleId: req.res?.locals?.roleId,
  }),
});



global.__basedir = __dirname;
console.log(__basedir);

const specs = {
  customCss: fs.readFileSync("./swagger.css", "utf-8"),
};

const PORT = process.env.PORT || 8084;

let io = new Socket({
  cors: {
    origin: "*",
  },
});

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  legacyMode: true, // Keep for connect-redis compatibility
});
redisClient.connect().catch(console.error);

await sequelize.sync({ alter: true });


const redisStore = new RedisStore({
  client: redisClient,
  prefix: "waridi:",
});

const REDIS_SESSION_SECRET = process.env.REDIS_SESSION_SECRET || 'your-secret-here';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const postProto = grpc.loadPackageDefinition(packageDefinition).post;

const grpcserver = new grpc.Server();

grpcserver.addService(postProto.PostService.service, {
  CreatePost: createPost,
  GetTimeline: getTimeline,
});


// Add reflection service
const reflection = new ReflectionService(postProto);
reflection.addToServer(grpcserver);

// Bind the gRPC server to a single port
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

app.use(
  cookieSession({
    name: "session",
    keys: ["waridi"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(detectDevice);
app.use(express.json({ limit: '800mb' }));
app.use(express.urlencoded({ limit: '800mb', extended: true }));
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
      secure: false, // Set to true in production with HTTPS
      httpOnly: false,
      maxAge: 1000 * 60 * 10,
    },
  })
);
// Existing /images static serving
app.use("/images", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  next();
}, express.static("Images"));

// Add this new block for /Posts (adjust headers if needed)
app.use("/Posts", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  next();
}, express.static("Posts"));

app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(options));

app.use("/api/v1", apartmentRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", roleRouter);
app.use("/api/v1", landlordRouter);
app.use("/api/v1", tenantRouter);
// app.use("/api/v1", agentRouter);
app.use("/api/v1", marketRouter);
app.use("/api/v1", roleRouter);
app.use("/api/v1/posts", postMediaRouter);
app.use("/api/v1/apartment", apartmentFilesRouter);
app.use("/api/v1", apartmentPropertiesRouter);
app.use("/api/v1", facilitiesRouter);
app.use("/api/v1", propertyFacilitiesRouter);
app.use("/api/v1/property", propertyFilesRouter);
app.use("/api/v1", propertyLocationRouter);
app.use("/api/v1/location", apartmentLocationRouter);
app.use("/api/v1", propertyPropertiesRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1/user", userProfileRouter);
app.use("/api/v1", friendRequestRouter);
app.use("/api/v1/token", notificationDeviceRouter);
app.use("/api/v1", rentPricingRouter);
app.use("/api/v1", ratingRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1", propertyRouter);
app.use("/api/v1", geoLocationRouter);
app.use("/api/v1/verify-apartment", apartmentVerifyRouter);


app.use('/graphql', Authenticated);

app.post('/locations', (req, res) => {
  const payload = req.body;
  console.log('Received location', payload);
  // broadcast to clients
  io.emit('location:update', payload);
  res.json({ ok: true });
});

app.use(graphqlUploadExpress());

// Start Apollo
await server.start();
server.applyMiddleware({ app });

const httpServer = http.createServer(app);

connectSocket(httpServer);

const startServer = async () => {
  try {
    await runMigrations();
    httpServer.listen(PORT, () => {
      console.log(`HTTP server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

io.listen(8085);

startServer();

global.ononline = new Map();

export default app;
