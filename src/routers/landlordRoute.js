import express from 'express';
import * as landlordController from '../controllers/landlordController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/landlord', Authenticated,   landlordController.upload, landlordController.registerLandlord);
router.get('/alllandlord', Authenticated, landlordController.getAllLandlord);
router.get('/landlordid/:id', Authenticated, landlordController.getLandlordById);
router.get('/landlorduser/:userId', Authenticated, landlordController.getSingleLandlord);

export default router;
