import { sequelize } from "../config/connectDb.js";
import { DataTypes } from "sequelize";
import User from "./authModel.js";

const UserProfile = sequelize.define("UserProfile", {
  userId: {
    type: DataTypes.INTEGER,
  },
  user_fname: {
    type: DataTypes.STRING,
  },
  user_lname: {
    type: DataTypes.STRING,
  },
  user_location: {
    type: DataTypes.STRING,
  },
  user_phonenumber: {
    type: DataTypes.INTEGER,
  },
  followers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  following: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  user_avatar: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
  },
});

UserProfile.associations = (models) => {
  UserProfile.belongsTo(User, {
    foreignKey: "userId",
  });
  return UserProfile;
};

export default UserProfile;
