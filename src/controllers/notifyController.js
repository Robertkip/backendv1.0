import admin from "firebase-admin";
import serviceAccount from "../../waridi-793c4-firebase-adminsdk-4z45i-cf675a6b0d.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let onlineUsers = [];
let tokens = [];

export const registerToken = (req, res) => {
  let { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  token = token.trim(); // Trim leading/trailing whitespace

  if (!tokens.includes(token)) {
    tokens.push(token);
  }

  console.log('Current tokens:', tokens);

  res.status(200).json({ message: "Successfully registered Token!" });
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
  if (!tokens || tokens.length === 0) {
    return res.status(400).json({ message: "No tokens registered!" });
  }

  const { title, body, imageUrl } = req.body;

  const message = {
    tokens : ['dYZ0RgQeRmamdLGXyOqsd0:APA91bHca8llZHmcX8AxfVGWsfU5M0sNcNV0FmWYc5f-cs4z5z77x77TOjb7n2yDx-XXa3EftQj5vsOTXJ40Vq4ShmHjH1hDjFa61NR6ao5MeAQlT6yfB1Q'],
    notification: {
      title,
      body,
      imageUrl, // Optional
    },
  };
  

  try {
    const response = await admin.messaging().send({
      token: 'dYZ0RgQeRmamdLGXyOqsd0:APA91bHca8llZHmcX8AxfVGWsfU5M0sNcNV0FmWYc5f-cs4z5z77x77TOjb7n2yDx-XXa3EftQj5vsOTXJ40Vq4ShmHjH1hDjFa61NR6ao5MeAQlT6yfB1Q',
      notification: {
        title,
        body,
      },
    });
    res.status(200).json({
      message: 'Successfully sent message',
      response,
    });
  } catch (err) {
    console.error("FCM Error:", err);  // Add this line
    res.status(500).json({
      message: "FCM Error",
      error: err, // Return the full error
    });
  }

}
