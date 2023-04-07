import express from 'express';
import { Signup, Signin, getAllUsers } from '../controllers/authController.js'; 

const router = express.Router();

router.post('/signup', Signup);
router.post('/signin', Signin);
router.get('/users', getAllUsers);

export default router;
