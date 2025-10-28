import express from 'express';
import * as propertyLocationController from '../controllers/propertyLocationController.js';

const router = express.Router();

router.post('/addlocation', propertyLocationController.CreatePropertyLocation);
router.get('/alllocations', propertyLocationController.GetPropertyLocation);
router.get('/location/:id', propertyLocationController.GetPropertyLocationById);
router.get('/update/:id', propertyLocationController.UpdatePropertyLocation);
router.get('/deletelocation/:id', propertyLocationController.DeletePropertyLocation);

export default router;
