import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Otp = sequelize.define("otp", {
  email: {
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
  expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expireIn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Otp;
