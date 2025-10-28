import express from 'express';
import * as propertyPropertiesController from '../controllers/propertyPropertiesController.js';

const router = express.Router();

router.post('/addproperties', propertyPropertiesController.CreateProperties);
router.get('/allproperties', propertyPropertiesController.GetPropertyProperties);
router.get('/properties/:id', propertyPropertiesController.GetPropertyPropertiesById);
router.get('/update/:id', propertyPropertiesController.UpdatePropertyProperties);
router.get('/deleteproperty/:id', propertyPropertiesController.DeletePropertyProperties);

export default router;
