import express from 'express';
import * as propertyLocationController from '../controllers/propertyLocationController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addlocation', Authenticated, propertyLocationController.CreatePropertyLocation);
router.get('/alllocations', propertyLocationController.GetPropertyLocation);
router.get('/locations', propertyLocationController.GetPropertyLocation);
router.get('/locations/search', propertyLocationController.GetPropertyLocation);
router.get('/location/:id', propertyLocationController.GetPropertyLocationById);
router.get('/update/:id', Authenticated, propertyLocationController.UpdatePropertyLocation);
router.get('/deletelocation/:id', Authenticated, propertyLocationController.DeletePropertyLocation);

export default router;
