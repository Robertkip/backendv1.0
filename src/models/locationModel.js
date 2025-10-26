import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";

const Location = sequelize.define("apartment_location", {
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },

apartment_id: {
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

export default Location;

Location.associations = (models) => {
    Location.belongsTo(Apartment, {
        foreignKey: "apartment_id",
    });
    return Location;
};
