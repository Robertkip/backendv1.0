import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";
import Landlord from "./landlordModel.js";
import Agent from "./agentModel.js";
import Tenant from "./tenantModel.js";

const Market = sequelize.define('Market', {
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
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
})

export default Market;

Market.associations = (models) => {
    Market.belongsTo(User, {
        foreignKey: 'sellerId',
    })
    Market.belongsTo(Landlord, {
        foreignKey: 'sellerId',
    })
     Market.belongsTo(Agent, {
        foreignKey: 'sellerId',
    })
    Market.belongsTo(Tenant, {
        foreignKey: 'sellerId',
    })
   return Seller;   
}
