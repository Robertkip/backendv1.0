import express from 'express';
import * as propertyFacilitiesController from '../controllers/propertyFacilitiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

// Mounted on /api/v1/property-facilities.
const router = express.Router();

router.get('/', propertyFacilitiesController.GetPropertyFacility);
router.get('/:id', propertyFacilitiesController.GetPropertyFacilityById);
router.post('/', Authenticated, propertyFacilitiesController.CreatePropertyFacility);
router.put('/:id', Authenticated, propertyFacilitiesController.UpdatePropertyFacility);
router.delete('/:id', Authenticated, propertyFacilitiesController.DeletePropertyFacility);

export default router;
