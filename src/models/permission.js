import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Roles from "./role.js";

const Permissions = sequelize.define("Permissions", {
  perm_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  perm_description: {
    type: DataTypes.STRING,
    allowNull: false
  }    
})

Permissions.associations = (models) => {
    Permissions.belongsToMany(Roles, {
        through: 'RolePermissions',
        as: 'roles',
        foreignKey: 'perm_id' 
    })

    return Permissions;
}

export default Permissions;
