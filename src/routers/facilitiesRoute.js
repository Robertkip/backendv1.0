import express from 'express';
import * as facilitiesController from '../controllers/facilitiesControllers.js';

const router = express.Router();

router.post('/addfacility', facilitiesController.CreateApartmentFacility);
router.get('/allfacilities', facilitiesController.ApartmentFacility);
router.get('/facilities/:id', facilitiesController.GetApartmentFacilityById);
router.get('/update/:id', facilitiesController.UpdateApartmentFacility);
router.get('/deletefacilities/:id', facilitiesController.DeleteApartmentFacility);

export default router;
