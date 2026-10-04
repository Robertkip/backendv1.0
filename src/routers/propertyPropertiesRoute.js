import express from 'express';
import * as propertyPropertiesController from '../controllers/propertyPropertiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

// Mounted on /api/v1/property-properties.
const router = express.Router();

router.get('/', propertyPropertiesController.GetPropertyProperties);
router.get('/:id', propertyPropertiesController.GetPropertyPropertiesById);
router.post('/', Authenticated, propertyPropertiesController.CreateProperties);
router.put('/:id', Authenticated, propertyPropertiesController.UpdatePropertyProperties);
router.delete('/:id', Authenticated, propertyPropertiesController.DeletePropertyProperties);

export default router;
