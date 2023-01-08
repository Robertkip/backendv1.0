import { DataTypes, INTEGER } from "sequelize";
import { sequelize } from "../config/connectDb";

const Seller = sequelize.define('Seller', {
    seller_fname: {
        type: DataTypes.STRING,
    },
    seller_lname: {
        type: DataTypes.STRING,
    },
    seller_phonenumber: {
        type: INTEGER,
    },
    seller_locations: {
        type: DataTypes.STRING,
    },
    seller_id: {
        type: DataTypes.INTEGER,
    },
    seller_avatar: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.BLOB,
    }
});

export default Seller;
