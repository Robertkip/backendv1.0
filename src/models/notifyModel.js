import { DataTypes, INTEGER, STRING } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const Notify = sequelize.define('notify', {
    belongsTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
        allowNull: true,
    },
    notification_avatar: {
    type: DataTypes.STRING,
    allowNull:false,
     },
     title: {
      type: DataTypes.TEXT,
      allowNull: true,
  },
   type: {
     type: DataTypes.BLOB,
     allowNull:true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  }
  
})

Notify.associations = (models) => {
    User.belongsTo(User, {
      foreignKey: "belongsTo",
    });
    return Notify;
  };
  
export default Notify;
  