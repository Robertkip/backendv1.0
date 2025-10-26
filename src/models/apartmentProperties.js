import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";

const ApartementProperties = sequelize.define("apartment_properties", {
  number_of_units: {
    type: DataTypes.STRING,
    allowNull: true,
  },
apartment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  number_of_one_bd: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  number_of_two_bd: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  number_of_three_bd: {
    type: DataTypes.INTEGER,
  },
  number_of_four_bd: {
    type: DataTypes.INTEGER,
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

export default ApartementProperties;

ApartementProperties.associations = (models) => {
    ApartementProperties.belongsTo(Apartment, {
        foreignKey: "apartment_id",
    });
    return ApartementProperties;
};

