import NotificationToken from "../models/notificationTokenModel.js";

export const notificationDeviceToken = async (req, res) => {
  const userId = req.body.userId;
  const deviceToken = req.body.deviceToken;

  try {
    if (!userId || !deviceToken) {
      res.status(400).send({
        msg: "Please provide all fields",
      });
    } else {
      const device = new NotificationToken({
        userId: userId,
        deviceToken: deviceToken,
      });

      await device.save();

      const responseToken = {
        userId: userId,
        deviceToken: deviceToken,
      };

      return res.status(200).send(responseToken);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
