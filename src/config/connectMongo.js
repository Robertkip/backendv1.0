import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/waridi");
    console.log("MongoDB connection established");
  } catch (error) {
    // Posts and chat messages live in MongoDB; the REST API backed by Postgres
    // keeps working, so log the failure instead of taking the server down.
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectDB;
