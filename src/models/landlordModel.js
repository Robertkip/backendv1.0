import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb";

const Landlord = sequelize.define('Landlord', {
    apartment_id: {
    
    },
    landlord_fname: {
        type: DataTypes.STRING,
    },
    landlord_lname: {
        type: DataTypes.STRING,
    },
    landlord_id: {
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


