import express from 'express';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

router.post('/create-message', messageController.sendMessage);
router.get('/get-messages/', messageController.getSenderReceiverMessage);

export default router;
