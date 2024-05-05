import admin from "firebase-admin";
import serviceAccount from "../../waridi-793c4-firebase-adminsdk-4z45i-cf675a6b0d.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let onlineUsers = [];
let tokens = [];

export const registerToken = (req, res) => {
  tokens.push(req.body.token);

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
  try {
    const { title, body, imageUrl } = req.body;
    await admin
      .messaging()
      .send({
        tokens,
        notification: {
          title,
          body,
          imageUrl,
        },
      })
      .then((data) => {
        res.send(200).json(`Data Send Is:${data}`);
      });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
};
