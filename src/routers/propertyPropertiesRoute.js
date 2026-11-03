import express from 'express';
import * as propertyPropertiesController from '../controllers/propertyPropertiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

// Mounted on /api/v1/property-properties.
const router = express.Router();

router.get('/', propertyPropertiesController.GetPropertyProperties);
router.get('/:id', propertyPropertiesController.GetPropertyPropertiesById);
router.post('/', Authenticated, validateBody(schemas.propertyProperties.create), propertyPropertiesController.CreateProperties);
router.put('/:id', Authenticated, validateBody(schemas.propertyProperties.update), propertyPropertiesController.UpdatePropertyProperties);
router.delete('/:id', Authenticated, propertyPropertiesController.DeletePropertyProperties);

export default router;
