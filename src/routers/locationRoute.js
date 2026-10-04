import express from 'express';
import * as locationController from '../controllers/locationController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

// Apartment locations, mounted on /api/v1/location.
const router = express.Router();

router.post('/addlocation', Authenticated, locationController.CreateLocation);
router.get('/alllocations', locationController.GetLocations);
router.get('/locations', locationController.GetLocations);
router.get('/locations/search', locationController.SearchLocations);
router.get('/locations/name/:name', locationController.GetLocationsByName);
router.get('/locations/:id', locationController.GetLocationById);
router.put('/locations/:id', Authenticated, locationController.UpdateLocation);
router.delete('/locations/:id', Authenticated, locationController.DeleteLocation);

export default router;
