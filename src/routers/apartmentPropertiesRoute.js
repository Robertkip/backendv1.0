import express from 'express';
import * as apartmentPropertiesController from '../controllers/apartmentPropertiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

// Mounted on /api/v1/apartment-properties.
const router = express.Router();

router.get('/', apartmentPropertiesController.GetApartementProperties);
router.get('/:id', apartmentPropertiesController.GetApartementPropertiesById);
router.post('/', Authenticated, apartmentPropertiesController.CreateApartementProperties);
router.put('/:id', Authenticated, apartmentPropertiesController.UpdateApartementProperties);
router.delete('/:id', Authenticated, apartmentPropertiesController.DeleteApartementProperties);

export default router;
