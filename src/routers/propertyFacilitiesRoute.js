import express from 'express';
import * as propertyFacilitiesController from '../controllers/propertyFacilitiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addfacility', Authenticated, propertyFacilitiesController.CreatePropertyFacility);
router.get('/allfacilities', propertyFacilitiesController.GetPropertyFacility);
router.get('/facilities/:id', propertyFacilitiesController.GetPropertyFacilityById);
router.get('/update/:id', Authenticated, propertyFacilitiesController.UpdatePropertyFacility);
router.get('/deletefacility/:id', Authenticated, propertyFacilitiesController.DeletePropertyFacility);

export default router;
