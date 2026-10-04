import express from 'express';
import * as propertyLocationController from '../controllers/propertyLocationController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

// Mounted on /api/v1/property-locations.
const router = express.Router();

router.get('/', propertyLocationController.GetPropertyLocation);
router.get('/:id', propertyLocationController.GetPropertyLocationById);
router.post('/', Authenticated, propertyLocationController.CreatePropertyLocation);
router.put('/:id', Authenticated, propertyLocationController.UpdatePropertyLocation);
router.delete('/:id', Authenticated, propertyLocationController.DeletePropertyLocation);

export default router;
