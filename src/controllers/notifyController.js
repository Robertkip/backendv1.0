import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import NotificationToken from "../models/notificationTokenModel.js";

import Notify from "../models/notifyModel.js";

// The service account key is a secret and is not committed; without it the
// server still starts and only push notifications are disabled.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  fileURLToPath(new URL("../../waridi-793c4-firebase-adminsdk-4z45i-cf675a6b0d.json", import.meta.url));
const firebaseEnabled = fs.existsSync(serviceAccountPath);

if (firebaseEnabled) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.warn(`Firebase service account not found at ${serviceAccountPath}, push notifications disabled`);
}

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
  if (!firebaseEnabled) {
    return res.status(503).json({ message: "Push notifications are not configured" });
  }

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

    const { title, body, imageUrl, type } = req.body;

    const response = await admin.messaging().send({
      token: notificationToken.deviceToken,
      notification: {
        title,
        body,
        imageUrl,
      },
    });

    await Notify.create({
      belongsTo: userId,
      message: body,
      notification_avatar: imageUrl || null,
      title: title || "info",
    });

    res.status(200).json({
      message: "Successfully sent message and saved notification",
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

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notifications = await Notify.findAll({
      where: { belongsTo: userId },
      order: [['timestamp', 'DESC']],
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
