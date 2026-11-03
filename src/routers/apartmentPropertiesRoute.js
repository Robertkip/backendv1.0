import express from 'express';
import * as apartmentPropertiesController from '../controllers/apartmentPropertiesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

// Mounted on /api/v1/apartment-properties.
const router = express.Router();

router.get('/', apartmentPropertiesController.GetApartementProperties);
router.get('/:id', apartmentPropertiesController.GetApartementPropertiesById);
router.post('/', Authenticated, validateBody(schemas.apartmentProperties.create), apartmentPropertiesController.CreateApartementProperties);
router.put('/:id', Authenticated, validateBody(schemas.apartmentProperties.update), apartmentPropertiesController.UpdateApartementProperties);
router.delete('/:id', Authenticated, apartmentPropertiesController.DeleteApartementProperties);

export default router;
