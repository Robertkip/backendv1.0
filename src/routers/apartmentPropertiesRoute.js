import express from 'express';
import * as apartmentPropertiesController from '../controllers/apartmentPropertiesController.js';

const router = express.Router();

router.post('/addproperties', apartmentPropertiesController.CreateApartementProperties);
router.get('/allproperties', apartmentPropertiesController.GetApartementProperties);
router.get('/properties/:id', apartmentPropertiesController.GetApartementPropertiesById);
router.get('/update/:id', apartmentPropertiesController.UpdateApartementProperties);
router.get('/deleteproperty/:userId', apartmentPropertiesController.DeleteApartementProperties);


export default router;
