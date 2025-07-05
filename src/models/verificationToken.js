import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Users from "./authModel.js";

const VerificationToken = sequelize.define("verificationtoken", {
  userId: {
    type: DataTypes.STRING,
  },
  token: {
    type: DataTypes.STRING,
  },
});

VerificationToken.associations = (models) => {
  VerificationToken.belongsTo(Users, {
    as: "user",
    foreignKey: "userId",
    foreignKeyConstraint: true,
  });
  return VerificationToken;
};

export default VerificationToken;
