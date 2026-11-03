import express from 'express';
import { userGeolocation, getUserCoordinates } from '../controllers/geoLocationController.js';

import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

const router = express.Router();

router.post('/location', Authenticated, validateBody(schemas.saveLocation), userGeolocation);

router.get('/get-location', Authenticated, getUserCoordinates);

export default router;