import { DataTypes, INTEGER } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const Seller = sequelize.define('Seller', {
    userId: {
        type: DataTypes.INTEGER,
    },
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

Seller.associations = (models) => {
    Seller.belongsTo(User, {
        foreignKey: 'userId',
    });
  return Seller;
}
