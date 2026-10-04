import express from 'express';
import * as facilitiesController from '../controllers/facilitiesControllers.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

// Mounted on /api/v1/apartment-facilities.
const router = express.Router();

router.get('/', facilitiesController.ApartmentFacility);
router.get('/:id', facilitiesController.GetApartmentFacilityById);
router.post('/', Authenticated, facilitiesController.CreateApartmentFacility);
router.put('/:id', Authenticated, facilitiesController.UpdateApartmentFacility);
router.delete('/:id', Authenticated, facilitiesController.DeleteApartmentFacility);

export default router;
