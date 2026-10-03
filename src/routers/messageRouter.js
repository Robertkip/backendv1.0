import express from 'express';
import * as messageController from '../controllers/messageController.js';

import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/create-message', Authenticated, messageController.sendMessage);
router.get('/get-messages/', Authenticated, messageController.getSenderReceiverMessage);
router.get('/get-all-messages', Authenticated, messageController.getMessages);

export default router;
