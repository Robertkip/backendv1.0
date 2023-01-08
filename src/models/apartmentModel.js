import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Landlord from "./landlordModel.js";

const Apartment = sequelize.define("Apartment", {
   landlord_id: {
     type: DataTypes.INTEGER,
   },
   agent_id: {
      type: DataTypes.INTEGER,
   },
    apartment_name: {
        type: DataTypes.STRING,
    },
    apartment_location: {
        type: DataTypes.STRING,
    },
    apartment_description: {
        type: DataTypes.STRING,
    },
    type1: {
        type: DataTypes.STRING
      },
    name1: {
        type: DataTypes.STRING
      },
    data1: {
        type: DataTypes.BLOB
      },
    type2: {
        type: DataTypes.STRING
      },
    name2: {
        type: DataTypes.STRING
      },
    data2: {
        type: DataTypes.BLOB
      },
    type3: {
        type: DataTypes.STRING
      },
    name3: {
        type: DataTypes.STRING
      },
    data3: {
        type: DataTypes.BLOB
      },
    type4: {
        type: DataTypes.STRING
      },
    name4: {
        type: DataTypes.STRING
      },
    data4: {
        type: DataTypes.BLOB
      },
});

export default Apartment;

Apartment.associations = (models) => {
  Apartment.belongsTo(Landlord, {
    foreignKey: ''
  })
}
