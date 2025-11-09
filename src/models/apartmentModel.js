import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Landlord from "./landlordModel.js";
import Agent from "./agentModel.js";

const Apartment = sequelize.define("rental_apartment", {
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
   landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  apartment_name: {
    type: DataTypes.STRING,
  },
  apartment_type: {
    type: DataTypes.STRING
  },
  apartment_description: {
    type: DataTypes.TEXT,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
  updateAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
});

export default Apartment;

Apartment.associate = (models) => {
  Apartment.belongsTo(models.Landlord, { foreignKey: "landlord_id" });
  Apartment.belongsTo(models.Agent, { foreignKey: "agent_id" }); // Fixed typo
  Apartment.hasOne(models.ApartmentFiles, { foreignKey: "apartment_id", as: "files" });
  Apartment.hasOne(models.Location, { foreignKey: "apartment_id", as: "location" });
  Apartment.hasOne(models.ApartmentProperties, { foreignKey: "apartment_id", as: "properties" });
};

