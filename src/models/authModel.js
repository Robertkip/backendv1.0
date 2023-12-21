import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Role from "./role.js";

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
  connections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
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
  code: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  user_avatar: {
    type: DataTypes.STRING,
    allowNull:true,
  },
  type: {
    type: DataTypes.BLOB,
    allowNull:true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
});

User.associations = (models) => {
  User.belongsTo(Role, {
    foreignKey: "roleId",
  });
  return User;
};

export default User;
