import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb";

const Order = sequelize.define('Order', {
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
