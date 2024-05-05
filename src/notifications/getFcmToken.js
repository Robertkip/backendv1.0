import User from "../models/authModel.js";

async function getFcmToken(req, res) {
  const { fcmToken } = req.body;
  const user = await User.findOne({ id: req.user.id });
  if (user) {
    user.fcmToken = fcmToken;
    await user.save();
    res.status(200).send({ message: "FCM Token saved successfully" });
  } else {
    res.status(404).send({ message: "User not found" });
  }
}
export default getFcmToken;
