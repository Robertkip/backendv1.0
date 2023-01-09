import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const Landlord = sequelize.define('Landlord', {
    userId: {
      type: DataTypes.INTEGER,
    },
    landlord_fname: {
        type: DataTypes.STRING,
    },
    landlord_lname: {
        type: DataTypes.STRING,
    },
    landlord_idno: {
        type: DataTypes.INTEGER,
    },
    landlord_phonenumber: {
        type: DataTypes.INTEGER,
    },
    landlord_location: {
        type: DataTypes.INTEGER,
    },
    landlord_avatar: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.BLOB,
    },
});

export default Landlord; 

Landlord.associations = (models) => {
    Landlord.belongsTo(User, {
        foreignKey: 'userId'
    })

return Landlord;    
}
