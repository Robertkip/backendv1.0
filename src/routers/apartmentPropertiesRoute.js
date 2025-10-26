import express from 'express';
import * as apartmentPropertiesController from '../controllers/apartmentPropertiesController.js';


router.post('/addproperties', apartmentPropertiesController.CreateApartementProperties);
router.get('/allproperties', apartmentPropertiesController.ApartementProperties);
router.get('/properties/:id', apartmentPropertiesController.GetApartementPropertiesById);
router.get('/update/:id', apartmentPropertiesController.UpdateApartementProperties);
router.get('/deleteproperty/:userId', apartmentPropertiesController.DeleteApartementProperties);

const router = express.Router();

export default router;
