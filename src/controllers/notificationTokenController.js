import { Op, literal } from "sequelize";
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

export const searchReceiverToken = async (req, res, next) => {
  // Retrieve all Tutorials from the database.  const user = req.query.userId; 

  const user = req.query.userId;
  var condition = user ? { 
    [Op.and]: [
      literal(`CAST("userId" AS TEXT) LIKE '%${user}%'`),
      literal(`"userId" IS NOT NULL`)
    ]
  } : null;

  await NotificationToken.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Apartments.",
      });
    });
};
