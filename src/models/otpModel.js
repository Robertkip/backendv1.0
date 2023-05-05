import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Otp = sequelize.define("Otp", {
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expireIn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Otp;
