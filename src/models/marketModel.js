import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Market = sequelize.define('Market', {
    product_name: {
        type: DataTypes.STRING
    },
    product_description: {
        type: DataTypes.STRING
    },
    product_price: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING
      },
    product_image: {
        type: DataTypes.STRING
    },
    data: {
        type: DataTypes.BLOB
      },
})

export default Market;
