import { sequelize } from "../config/connectDb";
import { DataTypes, STRING } from "sequelize";

const Tenant = sequelize.define('Tenant',{
    tenant_fname: {
        type: DataTypes.STRING
    },
    tenant_lname:{
        type: STRING,
    },
    tenant_location: {
        type: STRING,
    },
    tenant_id: {
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
    data: {
        type: DataTypes.BLOB
    }
});

export default Tenant;
