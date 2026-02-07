import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";
import Apartment from "./apartmentModel.js";

const Agent = sequelize.define("agents", {
  userId: {
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

  agent_id_photo: {
    type: DataTypes.STRING,
  },

  agent_address: {
    type: DataTypes.STRING,
  },

  agent_location: {
    type: DataTypes.STRING,
  },

  agent_verified: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
    allowNull: false,
  },
  agent_specialization: {
    type: DataTypes.STRING,
  },

  agent_description: {
    type: DataTypes.TEXT,
  },

  agent_avatar: {
    type: DataTypes.STRING,
  },

  type: {
    type: DataTypes.BLOB,
  },
});

export default Agent;

