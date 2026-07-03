import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Property from "./propertyModel.js";

const ServiceProvider = sequelize.define("apartment_service_providers", {

  apartment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  service_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider_contact: {
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

export default ServiceProvider;

ServiceProvider.associations = (models) => {
    ServiceProvider.belongsTo(Property, {
        foreignKey: "apartment_id",
    });
    return ServiceProvider;
};

