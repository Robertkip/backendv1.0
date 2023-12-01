import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Message = () => sequelize.define('Message', {
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

