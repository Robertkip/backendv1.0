import express from 'express';
import { userGeolocation, getUserCoordinates } from '../controllers/geoLocationController.js';

const router = express.Router();

router.post('/location', userGeolocation);

router.get('/get-location', getUserCoordinates);

export default router;