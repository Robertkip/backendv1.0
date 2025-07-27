import admin from "firebase-admin";
import serviceAccount from "../../waridi-793c4-firebase-adminsdk-4z45i-cf675a6b0d.json" assert { type: "json" };
import NotificationToken from "../models/notificationTokenModel.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let onlineUsers = [];
let tokens = [];

export const registerToken = async (req, res) => {
  const { token } = req.body;
  const userId = req.user?.id;

  if (!token || !userId) {
    return res.status(400).json({ message: 'Token and userId are required' });
  }

  try {
    const trimmedToken = token.trim();

    const existingToken = await NotificationToken.findOne({
      where: { userId, deviceToken: trimmedToken }
    });

    if (!existingToken) {
      await NotificationToken.create({
        userId,
        deviceToken: trimmedToken
      });
    }

    return res.status(200).json({ message: "Successfully registered token!" });

  } catch (error) {
    console.error("Error registering token:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const addNewUser = (username, socketId) => {
  !onlineUsers.some((users) => users.username === username) &&
    onlineUsers.push({ username, socketId });
};

export const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((users) => users.socketId !== socketId);
};

export const getUser = (username) => {
  return onlineUsers.find((users) => users.username === username);
};

export const sendTokenInformation = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notificationToken = await NotificationToken.findOne({
      where: { userId },
    });

    if (!notificationToken) {
      return res.status(404).json({ message: "No device token found for user" });
    }

    const { title, body, imageUrl } = req.body;

    const response = await admin.messaging().send({
      token: notificationToken.deviceToken,
      notification: {
        title,
        body,
        imageUrl,
      },
    });

    res.status(200).json({
      message: "Successfully sent message",
      response,
    });
  } catch (err) {
    console.error("FCM Error:", err);
    res.status(500).json({
      message: "FCM Error",
      error: err,
    });
  }
};
