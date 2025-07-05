import { sequelize } from "../config/connectDb.js";
import { DataTypes} from "sequelize";
import User from "./authModel.js";
import Apartment from "./apartmentModel.js";

const Tenant = sequelize.define('tenant',{
    userId: {
     type: DataTypes.INTEGER,
    },
    logentId: {
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

Tenant.associations = (models) => {
    Tenant.belongsTo(Apartment, {
        foreignKey: 'logentId',
    })
    return Tenant;
}

export default Tenant;
