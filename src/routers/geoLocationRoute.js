import express from 'express';
import { userGeolocation, getUserCoordinates } from '../controllers/geoLocationController.js';

import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/location', Authenticated, userGeolocation);

router.get('/get-location', Authenticated, getUserCoordinates);

export default router;