import { sequelize } from "../config/connectDb.js";
import { DataTypes} from "sequelize";
import User from "./authModel.js";

const Tenant = sequelize.define('Tenant',{
    userId: {
     type: DataTypes.INTEGER,
    },
    tenant_fname: {
        type: DataTypes.STRING
    },
    tenant_lname:{
        type: DataTypes.STRING,
    },
    tenant_location: {
        type: DataTypes.STRING,
    },
    tenant_idno: {
        type: DataTypes.INTEGER,
    },
    tenant_phonenumber: {
        type: DataTypes.INTEGER,
    },
    tenant_avatar: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
    },
});

Tenant.associations = (models) => {
    Tenant.belongsTo(User, {
       foreignKey: 'userId',
    })
   return Tenant; 
}

export default Tenant;
