import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const Connection = sequelize.define("connections", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  connectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
});

// Set up associations
Connection.associate = (models) => {
  Connection.belongsTo(models.User, {
    foreignKey: "userId",
    as: "requester",
  });
  Connection.belongsTo(models.User, {
    foreignKey: "connectionId",
    as: "recipient",
  });
};

export default Connection;
