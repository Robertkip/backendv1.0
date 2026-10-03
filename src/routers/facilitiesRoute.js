import express from 'express';
import * as facilitiesController from '../controllers/facilitiesControllers.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addfacility', Authenticated, facilitiesController.CreateApartmentFacility);
router.get('/allfacilities', facilitiesController.ApartmentFacility);
router.get('/facilities/:id', facilitiesController.GetApartmentFacilityById);
router.get('/update/:id', Authenticated, facilitiesController.UpdateApartmentFacility);
router.get('/deletefacilities/:id', Authenticated, facilitiesController.DeleteApartmentFacility);

export default router;
