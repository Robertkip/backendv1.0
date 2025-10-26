import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Property from "./propertyModel.js";

const PropertyFacility = sequelize.define("property_facilities", {
  facility_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  property_id: {
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

export default PropertyFacility;


PropertyFacility.associations = (models) => {
    PropertyFacility.belongsTo(Property, {
        foreignKey: "property_id",
    });
    return PropertyFacility;
};
