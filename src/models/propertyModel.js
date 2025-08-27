import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Landlord from "./landlordModel.js";
import Agent from "./agentModel.js";

const Property = sequelize.define("property", {
  agent_id: {
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
  apartment_type: {
    type: DataTypes.STRING
  },
  apartment_description: {
    type: DataTypes.TEXT,
  },
  apartment_type: {
    type: DataTypes.STRING,
  },
  apartment_price: {
    type: DataTypes.STRING,
  },
  apartment_previous_price: {
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

export default Property;

Property.associations = (models) => {
    Property.belongsTo(Agent, {
    foreignKey: "agent_id",
  });

  return Property;
};
