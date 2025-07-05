import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Order = sequelize.define('order', {
    totalPrice: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    totalQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})

export default Order;
