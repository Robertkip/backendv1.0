import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Landlord from "./landlordModel.js";
import Agent from "./agentModel.js";

const Apartment = sequelize.define("Apartment", {
  logent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  apartment_name: {
    type: DataTypes.STRING,
  },
  apartment_location: {
    type: DataTypes.STRING,
  },
  apartment_county: {
    type: DataTypes.STRING,
  },
  apartment_description: {
    type: DataTypes.TEXT,
  },
  apartment_type: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  latitude: {
    type: DataTypes.STRING,
  },
  longitude: {
    type: DataTypes.STRING,
  },
  type1: {
    type: DataTypes.STRING,
  },
  name1: {
    type: DataTypes.STRING,
  },
  data1: {
    type: DataTypes.BLOB,
  },
  type2: {
    type: DataTypes.STRING,
  },
  name2: {
    type: DataTypes.STRING,
  },
  data2: {
    type: DataTypes.BLOB,
  },
  type3: {
    type: DataTypes.STRING,
  },
  name3: {
    type: DataTypes.STRING,
  },
  data3: {
    type: DataTypes.BLOB,
  },
  type4: {
    type: DataTypes.STRING,
  },
  name4: {
    type: DataTypes.STRING,
  },
  data4: {
    type: DataTypes.BLOB,
  },
});

export default Apartment;

Apartment.associations = (models) => {
  Apartment.belongsTo(Landlord, {
    foreignKey: "logent_id",
  });
  Apartment.belongsTo(Agent, {
    foreignKey: "logent_id",
  });
  return Apartment;
};
