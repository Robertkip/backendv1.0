import cookieSession from "cookie-session";
import express from "express";
import cors from 'cors';
import helmet from "helmet";
import logger from 'morgan';
import apartmentRouter from './src/routers/apartmentRoute.js';
import authRouter from './src/routers/authRoute.js';


const app = express();
let corsOptions = {
    localhost: "http://192.168.0.37:8084"
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


app.use("/api/v1", apartmentRouter);
app.use("/api/v1", authRouter);

app.listen(PORT, '192.168.0.37', () => {
    console.log(`Server is running on port`)
})

export default app;
