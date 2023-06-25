import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const NotificationToken = sequelize.define("NotificationToken", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  deviceToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

NotificationToken.associations = (models) => {
  NotificationToken.belongsTo(User, {
    foreignKey: "userId",
  });
  return NotificationToken;
};

export default NotificationToken;
