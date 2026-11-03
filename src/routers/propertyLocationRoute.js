import express from 'express';
import * as propertyLocationController from '../controllers/propertyLocationController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

// Mounted on /api/v1/property-locations.
const router = express.Router();

router.get('/', propertyLocationController.GetPropertyLocation);
router.get('/:id', propertyLocationController.GetPropertyLocationById);
router.post('/', Authenticated, validateBody(schemas.propertyLocations.create), propertyLocationController.CreatePropertyLocation);
router.put('/:id', Authenticated, validateBody(schemas.propertyLocations.update), propertyLocationController.UpdatePropertyLocation);
router.delete('/:id', Authenticated, propertyLocationController.DeletePropertyLocation);

export default router;
