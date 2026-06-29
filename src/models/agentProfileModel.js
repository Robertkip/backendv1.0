import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";
import Apartment from "./apartmentModel.js";

const AgentProfile = sequelize.define("agent_profile", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  agent_fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  agent_lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  agent_mname: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  agent_phonenumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  agent_idno: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  agent_gender: {
    type: DataTypes.STRING,
  },

  agent_verified: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
    allowNull: false,
  }
});

export default AgentProfile;

AgentProfile.associate = (models) => {
  AgentProfile.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });
};
