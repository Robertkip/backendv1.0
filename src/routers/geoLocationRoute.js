import express from 'express';
import { userGeolocation } from '../controllers/geoLocationController.js';

const router = express.Router();

router.post('/location', userGeolocation);

export default router;