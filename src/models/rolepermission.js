import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const RolePermissions = sequelize.define('RolePermissions', {
  role_id: {
    type: DataTypes.INTEGER
  },
  perm_id: {
    type: DataTypes.INTEGER
  }
})

export default RolePermissions;
