import admin from "firebase-admin";
import serviceAccount from "../../waridi-598ea-firebase-adminsdk-l68tn-bea02cceb4.json";

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
