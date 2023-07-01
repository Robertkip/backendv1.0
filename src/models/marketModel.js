import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";
import Landlord from "./landlordModel.js";
import Agent from "./agentModel.js";
import Tenant from "./tenantModel.js";
import CartItem from "./cartItemModel.js";

const Market = sequelize.define("Market", {
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_price: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Market;

Market.associations = (models) => {
  Market.hasOne(CartItem, {
    foreignKey: "sellerId",
    as: "cartitem",
  });
  Market.belongsTo(User, {
    foreignKey: "sellerId",
  });
  Market.belongsTo(Landlord, {
    foreignKey: "sellerId",
  });
  Market.belongsTo(Agent, {
    foreignKey: "sellerId",
  });
  Market.belongsTo(Tenant, {
    foreignKey: "sellerId",
  });
  return Market;
};
