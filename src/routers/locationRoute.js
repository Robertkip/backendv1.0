import express from 'express';
import * as locationController from '../controllers/locationController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addlocation', Authenticated, locationController.CreateLocation);
router.get('/alllocations', locationController.GetLocations);
router.get('/locations', locationController.GetLocations);
router.get('/locations/search', locationController.SearchLocations);
router.get('/locations/name/:name', locationController.GetLocationsByName);
router.get('/locations/:id', locationController.GetLocationById);
router.get('/update/:id', Authenticated, locationController.UpdateLocation);
router.get('/deletelocation/:id', Authenticated, locationController.DeleteLocation);

export default router;
