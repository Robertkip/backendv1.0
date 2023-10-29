import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb";
import User from "./authModel";

const Chat = sequelize.define('Chat', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    messageType: {
        type: String,
        validate: {
            isIn: [['text', 'image']]
        }
    },
    message: {
        type: Text,
        allowNull: true,
    },
    timestamp: {
        type: Date,
        defaultValue: Date.now(),
        allowNull: true,
    }

})

Chat.associations = (models) => {
    Chat.belongsTo(User, {
        foreignKey: 'senderId'
    }),

    Chat.associations(User, {
        foreignKey: 'receiverId'
    })

    return Chat;
};

export default Chat;
