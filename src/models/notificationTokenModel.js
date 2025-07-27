// notificationTokenModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const NotificationToken = sequelize.define("notificationtokens", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deviceToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

NotificationToken.belongsTo(User, {
  foreignKey: "userId",
});

export default NotificationToken;
