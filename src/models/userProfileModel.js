import { sequelize } from "../config/connectDb.js";
import { DataTypes } from "sequelize";
import User from "./authModel.js";

const UserProfile = sequelize.define("userprofile", {
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
    type: DataTypes.BIGINT,
  },
  user_avatar: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'https://api.waridi.co/images/userprofile.png',
  },
  type: {
    type: DataTypes.STRING,
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

  pendingConnections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  acceptedConnections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  rejectedConnections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  }
});


UserProfile.associations = (models) => {
  UserProfile.belongsTo(User, {
    foreignKey: "userId",
  });
  return UserProfile;
};

export default UserProfile;
