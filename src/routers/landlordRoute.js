import express from 'express';
import * as landlordController from '../controllers/landlordController.js';

const router = express.Router();

router.post('/landlord',   landlordController.upload, landlordController.registerLandlord);
router.get('/alllandlord', landlordController.getAllLandlord);
router.get('/landlord/:id', landlordController.getLandlordById);

export default router;
