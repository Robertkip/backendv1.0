import express from 'express';
import * as propertyFacilitiesController from '../controllers/propertyFacilitiesController.js';

const router = express.Router();

router.post('/addfacility', propertyFacilitiesController.CreatePropertyFacility);
router.get('/allfacilities', propertyFacilitiesController.GetPropertyFacility);
router.get('/facilities/:id', propertyFacilitiesController.GetPropertyFacilityById);
router.get('/update/:id', propertyFacilitiesController.UpdatePropertyFacility);
router.get('/deletefacility/:id', propertyFacilitiesController.DeletePropertyFacility);

export default router;
