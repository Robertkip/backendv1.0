import admin from "firebase-admin";
import serviceAccount from "../../waridi-793c4-firebase-adminsdk-4z45i-f7be711bb9.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let tokens = [];

export const registerToken = (req, res) => {
  tokens.push(req.body.token);

  res.status(200).json({ message: "Successfully registered Token!" });
};

export const sendTokenInformation = async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });

    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (error) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
};
