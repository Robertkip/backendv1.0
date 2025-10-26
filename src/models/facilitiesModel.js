import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";

const Facility = sequelize.define("property_properties", {
  facility_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apartment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
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

export default Facility;


Facility.associations = (models) => {
    Facility.belongsTo(Apartment, {
        foreignKey: "apartment_id",
    });
    return Facility;
};
