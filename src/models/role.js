import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Role = sequelize.define('role', {
  roleName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      
    }
})

export default Role;
