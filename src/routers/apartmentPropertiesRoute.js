import express from 'express';
import * as apartmentPropertiesController from '../controllers/apartmentPropertiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addproperties', Authenticated, apartmentPropertiesController.CreateApartementProperties);
router.get('/allproperties', apartmentPropertiesController.GetApartementProperties);
router.get('/properties/:id', apartmentPropertiesController.GetApartementPropertiesById);
router.get('/update/:id', Authenticated, apartmentPropertiesController.UpdateApartementProperties);
router.get('/deleteproperty/:userId', Authenticated, apartmentPropertiesController.DeleteApartementProperties);


export default router;
