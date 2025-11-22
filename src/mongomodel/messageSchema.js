// mongomodel/messageSchema.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, index: true },
    senderId: { type: Number, required: true },
    receiverId: { type: Number, required: true },
    senderName: String,
    message: String,
    fileUrl: String,
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "audio"],
      default: "text",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
