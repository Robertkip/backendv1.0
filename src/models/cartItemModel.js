import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Market from "./marketModel.js";
import User from "./authModel.js";

const CartItem = sequelize.define("cartitem", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
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
