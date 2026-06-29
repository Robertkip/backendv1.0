import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";
import Apartment from "./apartmentModel.js";

const AgentLocation = sequelize.define("agent_location", {
  agent_profile_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  agent_county: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  agent_subcounty: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  agent_town: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  agent_street: {
    type: DataTypes.STRING,
    allowNull: false,
  },


  agent_location_description: {
    type: DataTypes.STRING,
  }
});


AgentLocation.associate = (models) => {
  AgentLocation.belongsTo(models.Agent, {
    foreignKey: "agent_profile_id",
    as: "agent",
  });
};


export default AgentLocation;
