import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Landlord from "./landlordModel.js";
import Agent from "./agentModel.js";

const Property = sequelize.define("property", {
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  property_name: {
    type: DataTypes.STRING,
  },
  property_location: {
    type: DataTypes.STRING,
  },
  property_county: {
    type: DataTypes.STRING,
  },
  property_type: {
    type: DataTypes.STRING
  },
  property_description: {
    type: DataTypes.TEXT,
  },
  property_type: {
    type: DataTypes.STRING,
  },
  property_price: {
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

Property.associations = (models) => {

  Property.belongsTo(Agent, {
    foreignKey: "agent_id",
  });
  return Property;
};
