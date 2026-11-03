import express from 'express';
import * as facilitiesController from '../controllers/facilitiesControllers.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

// Mounted on /api/v1/apartment-facilities.
const router = express.Router();

router.get('/', facilitiesController.ApartmentFacility);
router.get('/:id', facilitiesController.GetApartmentFacilityById);
router.post('/', Authenticated, validateBody(schemas.apartmentFacilities.create), facilitiesController.CreateApartmentFacility);
router.put('/:id', Authenticated, validateBody(schemas.apartmentFacilities.update), facilitiesController.UpdateApartmentFacility);
router.delete('/:id', Authenticated, facilitiesController.DeleteApartmentFacility);

export default router;
