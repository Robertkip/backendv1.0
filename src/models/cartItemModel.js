import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Market from "./marketModel.js";
import User from "./authModel.js";

const CartItem = sequelize.define("CartItem", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

CartItem.associations = (models) => {
  CartItem.belongsTo(Market, {
    foreignKey: "productId",
    as: "market",
  });
  CartItem.belongsTo(User, {
    foreignKey: "userId",
  });

  return CartItem;
};

export default CartItem;
