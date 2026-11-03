import express from 'express';
import * as messageController from '../controllers/messageController.js';

import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

const router = express.Router();

router.post('/create-message', Authenticated, validateBody(schemas.sendMessage), messageController.sendMessage);
router.get('/get-messages/', Authenticated, messageController.getSenderReceiverMessage);
router.get('/get-all-messages', Authenticated, messageController.getMessages);

export default router;
