import express from 'express';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/send/:id', chatController.sendMessage);
router.get('/users', chatController.getUsers);
router.get('/show/:id', chatController.showMessage);

export default router;
