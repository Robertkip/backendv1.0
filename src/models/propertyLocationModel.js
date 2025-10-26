import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Property from "./propertyModel.js";

const PropertyLocation = sequelize.define("property_location", {
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },

property_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  county: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city_town: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.STRING,
  },
  longitude: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  location_description: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updateAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default PropertyLocation;

PropertyLocation.associations = (models) => {
    PropertyLocation.belongsTo(Property, {
        foreignKey: "property_id",
    });
    return PropertyLocation;
};
