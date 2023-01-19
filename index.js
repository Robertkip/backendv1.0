import cookieSession from "cookie-session";
import express from "express";
import cors from 'cors';
import helmet from "helmet";
import logger from 'morgan';
import path from "path";
import url from "url";
import { Socket } from "socket.io";
import apartmentRouter from './src/routers/apartmentRoute.js';
import authRouter from './src/routers/authRoute.js';
import roleRouter from './src/routers/roleRoute.js';
import permissionRouter from './src/routers/permission.js';
import marketRouter from "./src/routers/marketRoute.js";
import landlordRouter from "./src/routers/landlordRoute.js";
import tenantRouter from "./src/routers/tenantRoute.js";
import sellerRouter from "./src/routers/sellerRoute.js";
import agentRouter from "./src/routers/agentRoute.js";


const app = express();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

global.__basedir = __dirname;

console.log(__basedir);

let corsOptions = {
    localhost: "http://192.168.0.28:8084"
};


// const Roles = db.roles;
const PORT = process.env.PORT || 8084;

app.use(
    cookieSession({ name: "session", keys: ["waridi"], maxAge: 24 * 60 * 60 * 100 })
  )
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(logger('common'));

app.use("/images", express.static('Images'));

app.use("/api/v1", apartmentRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", roleRouter);
app.use("/api/v1", permissionRouter);
app.use("/api/v1", marketRouter);
app.use("/api/v1", landlordRouter);
app.use("/api/v1", tenantRouter);
app.use("/api/v1", sellerRouter);
app.use("/api/v1", agentRouter);


const server =  app.listen(PORT, '192.168.0.37', () => {
    console.log(`Server is running on port`)
})

const io = Socket(server, {
    cors: {
        origin: "http://localhost:8084",
    },
});

global.ononline = new Map();



export default app;
