import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Role from "./role.js";
import Message from "./messageModel.js";
import Connection from "./connectionsModel.js";
const User = sequelize.define("User", {
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirm_password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dateofbirth: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  user_avatar: {
    type: DataTypes.STRING,
    allowNull:false,
    defaultValue: 'https://api.waridi.co/images/userprofile.png',
  },
  type: {
    type: DataTypes.BLOB,
    allowNull:true,
  }, 
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
    },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  connectionsRequest: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
  },
  connectionRequestSent: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
  },
});

User.associations = (models) => {
  User.belongsTo(Role, {
    foreignKey: "roleId",
  });

  User.hasMany(Connection, {
     foreignKey: "connectionId",
  })

  return User;
};

export default User;
