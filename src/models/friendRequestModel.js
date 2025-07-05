import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const FriendRequest = sequelize.define("friendrequests", {
  status: {
    type: DataTypes.ENUM("pending", "accepted", "declined"),
    allowNull: false,
    defaultValue: "pending",
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
// Define model associations
User.hasMany(FriendRequest, { as: "sentRequests", foreignKey: "senderId" });
User.hasMany(FriendRequest, {
  as: "receivedRequests",
  foreignKey: "receiverId",
});

FriendRequest.associations = (models) => {
  FriendRequest.belongsTo(User, {
    foreignKey: 'senderId',
  })

  FriendRequest.belongsTo(User, {
    foreignKey: 'receiverId',
  })
}
export default FriendRequest;
