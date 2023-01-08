import express from 'express';
import * as sellerController from '../controllers/sellerController';

const router = express.Router();

router.post('/seller',    sellerController.upload, sellerController);
router.get('/allseller',  sellerController.getAllAgents);
router.get('/seller/:id', sellerController.getAgentById);

export default router;
