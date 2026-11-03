import express from 'express';
import * as propertyFacilitiesController from '../controllers/propertyFacilitiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

// Mounted on /api/v1/property-facilities.
const router = express.Router();

router.get('/', propertyFacilitiesController.GetPropertyFacility);
router.get('/:id', propertyFacilitiesController.GetPropertyFacilityById);
router.post('/', Authenticated, validateBody(schemas.propertyFacilities.create), propertyFacilitiesController.CreatePropertyFacility);
router.put('/:id', Authenticated, validateBody(schemas.propertyFacilities.update), propertyFacilitiesController.UpdatePropertyFacility);
router.delete('/:id', Authenticated, propertyFacilitiesController.DeletePropertyFacility);

export default router;
