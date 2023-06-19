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
    allowNull: null,
  },
  user_avatar: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.BLOB,
  },
  verified: {
    type: DataTypes.BOOLEAN,
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
