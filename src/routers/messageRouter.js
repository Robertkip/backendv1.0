import express from 'express';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

router.post('/create-message', messageController.sendMessage);
router.get('/get-messages/', messageController.getSenderReceiverMessage);
router.get('/get-all-messages', messageController.getMessages);

export default router;
