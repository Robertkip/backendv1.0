import Message from "../models/messageModel.js";
import User from "../models/authModel.js";
import { sequelize } from "../config/connectDb.js";
import { Op } from "sequelize";

export const sendMessage = async (req, res) => {
    const  {senderId, message, receiverId } = req.body; 

    try {

    await Message.create({senderId, message, receiverId}); 

    return res.status(200).json({message: "Message sent successfully"});

    } catch (error) {
        return res.status(500).json({message: error.message}); 
    }
}

export const getSenderReceiverMessage = async (req, res) => {
    const { senderId, receiverId } = req.query;

    try {
        const messages = await sequelize.query(
            `
            SELECT
                m.*,
                s.id AS senderId, s.username AS senderUsername, s.email AS senderEmail, s.user_avatar AS senderAvatar,
                r.id AS receiverId, r.username AS receiverUsername, r.email AS receiverEmail, r.user_avatar AS receiverAvatar
            FROM
                "Messages" m
            LEFT JOIN
                "Users" s ON m."senderId" = s.id
            LEFT JOIN
                "Users" r ON m."receiverId" = r.id
            WHERE
                (m."senderId" = :senderId AND m."receiverId" = :receiverId)
                OR
                (m."senderId" = :receiverId AND m."receiverId" = :senderId)
            `,
            {
                replacements: { senderId, receiverId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        return res.status(200).json({ messages });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
