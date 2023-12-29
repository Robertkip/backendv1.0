import { DataTypes, STRING, TEXT } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from './authModel.js';
const Message = sequelize.define('Message', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    messageType: {
        type: STRING,
        validate: {
            isIn: [['text', 'image']]
        }
    },
    message: {
        type: TEXT,
        allowNull: true,
    },
})


export default Message;
  
Message.associations = (models) => {
    Message.belongsTo(User, {
        foreignKey: "senderId",
        as: "sender",
    });

    Message.belongsTo(User, {
        foreignKey: "receiverId",
        as: "receiver",
    });

    return Message;
};
