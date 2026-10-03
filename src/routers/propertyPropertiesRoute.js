import express from 'express';
import * as propertyPropertiesController from '../controllers/propertyPropertiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addproperties', Authenticated, propertyPropertiesController.CreateProperties);
router.get('/allproperties', propertyPropertiesController.GetPropertyProperties);
router.get('/properties/:id', propertyPropertiesController.GetPropertyPropertiesById);
router.get('/update/:id', Authenticated, propertyPropertiesController.UpdatePropertyProperties);
router.get('/deleteproperty/:id', Authenticated, propertyPropertiesController.DeletePropertyProperties);

export default router;
