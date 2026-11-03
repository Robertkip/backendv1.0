import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/waridi");
    logger.info("MongoDB connection established");
  } catch (error) {
    // Posts and chat messages live in MongoDB; the REST API backed by Postgres
    // keeps working, so log the failure instead of taking the server down.
    logger.error({ error: error.message }, "MongoDB connection error");
  }
};

export default connectDB;
