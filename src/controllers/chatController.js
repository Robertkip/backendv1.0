import Chat from "../models/chatMessage";
import User from "../models/authModel";
import { Op } from "sequelize";

export const getUsers = async (req, res, next) => {

     await User.findAll().then(data => {
        res.status(200).send(data);
     }).catch(err => {
        res.status(500).send(err);
     })
}

export const sendMessage = async (req, res, next) => {
   req.check('chat','Chat in required').not().isEmpty()

   try {
     const results = await Chat.create({
        chat: req.body.chat,
        fromUserId: req.userData.id,
        toUserId: req.params.id
     })
     res.io.emit('chat', {receiver: req.params.id, sender: req.userData.id, results})
     res.json(results)
   } catch (error) {
     res.json(error)
   }
}

export const showMessage = async (req, res) => {
   const chat = Chat.findAll({
        where: {
            [req.Op.or]: [
                {
                    fromUserId: req.userData.id,
                    toUserId: req.params.id
                }, {
                    fromUserId: req.params.id,
                    toUserId: req.userData.id
                }
            ]
        }
    })
    res.json(chat)
}
