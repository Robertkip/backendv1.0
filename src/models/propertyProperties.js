import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Property from "./propertyModel.js";

const PropertyProperties = sequelize.define("property_properties", {

  property_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bedrooms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bathrooms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kitchen: {
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

export default PropertyProperties;

PropertyProperties.associations = (models) => {
    PropertyProperties.belongsTo(Property, {
        foreignKey: "property_id",
    });
    return PropertyProperties;
};

