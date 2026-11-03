import NotificationToken from "../models/notificationTokenModel.js";
import { isAdmin } from "../helpers/ownership.js";

// Registers a device for the logged-in user's push notifications.
export const notificationDeviceToken = async (req, res) => {
  const { deviceToken } = req.body;
  const device = await NotificationToken.create({ userId: req.user.id, deviceToken });
  return res.status(200).send({ userId: device.userId, deviceToken: device.deviceToken });
};

// Device tokens of ?userId= (only for that user or an admin), or of the
// logged-in user when no userId is given.
export const searchReceiverToken = async (req, res) => {
  const userId = req.query.userId === undefined ? req.user.id : Number(req.query.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).send({ message: "userId must be a number" });
  }
  if (userId !== req.user.id && !isAdmin(req.user)) {
    return res.status(403).send({ message: "You can only read your own device tokens" });
  }
  const tokens = await NotificationToken.findAll({ where: { userId } });
  return res.send(tokens);
};
