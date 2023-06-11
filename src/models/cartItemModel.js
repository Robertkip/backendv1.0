import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Market from "./marketModel.js";
import User from "./authModel.js";

const CartItem = sequelize.define('CartItem', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
       type: DataTypes.INTEGER,
       allowNull: false
    },
    product_name: {
        type: DataTypes.STRING
    },
    product_price: {
        type: DataTypes.INTEGER
    },
    product_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})

CartItem.associations = (models) => {
    CartItem.belongsTo(Market, {
        foreignKey: 'product_id'
    });
    CartItem.belongsTo(User, {
        foreignKey: 'userId'
    });
    Market.hasMany(CartItem);

    return CartItem
}

export default CartItem;
