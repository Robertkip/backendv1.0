import { DataTypes, INTEGER, STRING } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "./authModel.js";

const Notify = sequelize.define('notify', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recipients: {
        type: DataTypes.ARRAY(INTEGER),
        allowNull: true,
    },
    message: {
        type: Text,
        allowNull: true,
    },
    notification_avatar: {
    type: DataTypes.STRING,
    allowNull:false,
     },
   type: {
     type: DataTypes.BLOB,
     allowNull:true,
  }, 
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
    timestamp: {
        type: Date,
        defaultValue: Date.now(),
        allowNull: true,
    }
})

Notify.associations = (models) => {
    User.belongsTo(User, {
      foreignKey: "senderId",
    });
    return Notify;
  };
  
export default Notify;
  