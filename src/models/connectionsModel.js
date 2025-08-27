import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

//Connection model
const Connection = sequelize.define("connections",
{
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    connectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
      }
    }, {
      timestamps: true,
    });
    
Connection.associations = (models) => {
  Connection.belongsTo(User, {
     foreignKey: "userId",
     as: "user",
  });
  Connection.belongsTo(User, {
   foreignKey: "connectionId",
   as: "connection",
  });

  return Connection;
}

export default Connection;
