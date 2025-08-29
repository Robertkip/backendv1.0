import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  roomCode: String, 
  senderId: Number, 
  senderName: String,
  receiverId: Number,
  type: { type: String, enum: ["MESSAGE", "FILE"] },
  message: String,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", MessageSchema);

