import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb";
import User from "./authModel";

const Chat = sequelize.define('Chat', {
    chat: {
        type: DataTypes.TEXT, 
        allowNull: false,
    },

    fromUserId: {
        type: DataTypes.INTEGER
    },

    toUserId: {
        type: DataTypes.INTEGER
    },

})

Chat.associations = (models) => {
    Chat.belongsTo(User, {
        foreignKey: 'fromUserId'
    }),

    Chat.associations(User, {
        foreignKey: 'toUserId'
    })

    return Chat;
};

export default Chat;
