import Message from "../models/messageModel.js";
import { sequelize } from "../config/connectDb.js";
import { Op } from "sequelize";
import { isAdmin } from "../helpers/ownership.js";

// Messages are always sent as the logged-in user.
export const sendMessage = async (req, res) => {
    const { message, receiverId, messageType } = req.body;
    if (!message || !Number.isInteger(Number(receiverId))) {
        return res.status(400).json({ message: "message and receiverId are required" });
    }
    await Message.create({ senderId: req.user.id, receiverId: Number(receiverId), message, messageType });
    return res.status(200).json({ message: "Message sent successfully" });
}

// The conversation between senderId and receiverId. Only someone taking part
// in it (or an admin) may read it.
export const getSenderReceiverMessage = async (req, res) => {
    const senderId = Number(req.query.senderId);
    const receiverId = Number(req.query.receiverId);
    if (!Number.isInteger(senderId) || !Number.isInteger(receiverId)) {
        return res.status(400).json({ message: "senderId and receiverId must be numbers" });
    }
    if (!isAdmin(req.user) && req.user.id !== senderId && req.user.id !== receiverId) {
        return res.status(403).json({ message: "You can only read your own conversations" });
    }

    const messages = await sequelize.query(
        `
        SELECT
            m.*,
            s.id AS "senderId", s.username AS "senderUsername", s.email AS "senderEmail", s.user_avatar AS "senderAvatar",
            r.id AS "receiverId", r.username AS "receiverUsername", r.email AS "receiverEmail", r.user_avatar AS "receiverAvatar"
        FROM messages m
        LEFT JOIN users s ON m."senderId" = s.id
        LEFT JOIN users r ON m."receiverId" = r.id
        WHERE
            (m."senderId" = :senderId AND m."receiverId" = :receiverId)
            OR
            (m."senderId" = :receiverId AND m."receiverId" = :senderId)
        ORDER BY m."createdAt" ASC
        `,
        {
            replacements: { senderId, receiverId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).json({ messages });
};

export const getMessages = async (req, res) => {
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: req.user.id },
                { receiverId: req.user.id },
            ],
        },
        order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ messages });
}
