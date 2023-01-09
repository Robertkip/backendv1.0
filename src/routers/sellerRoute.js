import express from 'express';
import * as sellerController from '../controllers/sellerController.js';

const router = express.Router();

router.post('/seller', sellerController.upload, sellerController.registerSeller);
router.get('/allseller',  sellerController.getAllSeller);
router.get('/seller/:id', sellerController.getSellerByPK);

export default router;
