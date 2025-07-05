import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";
import Apartment from "./apartmentModel.js";

const Agent = sequelize.define("agents", {
  userId: {
    type: DataTypes.INTEGER,
  },
  agent_fname: {
    type: DataTypes.STRING,
  },
  agent_lname: {
    type: DataTypes.INTEGER,
  },
  agent_phonenumber: {
    type: DataTypes.STRING,
  },
  agent_idno: {
    type: DataTypes.INTEGER,
  },
  agent_location: {
    type: DataTypes.STRING,
  },
  agent_avatar: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.BLOB,
  },
});

export default Agent;

Agent.associations = (models) => {
  Agent.belongsTo(User, {
    foreignKey: "userId",
  });

  Agent.hasMany(Apartment, {
    foreignKey: "id",
    as: "apartments",
  });

  return Agent;
};
