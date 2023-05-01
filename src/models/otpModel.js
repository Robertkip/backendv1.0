import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb";

const Otp = sequelize.define("Otp", {
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expireIn: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
});

export default Otp;
