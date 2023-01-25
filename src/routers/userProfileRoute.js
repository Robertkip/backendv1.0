import express from 'express';
import * as userProfileController from '../controllers/userController.js';

const router = express.Router();

router.post('/userprofile', userProfileController.upload, userProfileController.createUserProfile);
router.get('alluserprofile', userProfileController.getUserProfile);

export default router;
