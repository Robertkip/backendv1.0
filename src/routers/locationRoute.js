import express from 'express';
import * as locationController from '../controllers/locationController.js';

const router = express.Router();

router.post('/addlocation', locationController.CreateLocation);
router.get('/alllocations', locationController.GetLocations);
router.get('/locations', locationController.GetLocations);
router.get('/locations/search', locationController.SearchLocations);
router.get('/locations/name/:name', locationController.GetLocationsByName);
router.get('/locations/:id', locationController.GetLocationById);
router.get('/update/:id', locationController.UpdateLocation);
router.get('/deletelocation/:id', locationController.DeleteLocation);

export default router;
