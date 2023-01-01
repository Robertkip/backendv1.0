import express from 'express';
import * as marketController from '../controllers/marketController.js';

const router = express.Router();

router.post('/market', marketController.upload, marketController.createMarket);
router.get('/allmarket', marketController.getMarket);

export default router;
