import express from 'express';
import * as apartmentFilesController from '../controllers/apartmentFilesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

const router = express.Router();

router.post('/addfiles', Authenticated, apartmentFilesController.upload, validateBody(schemas.uploadApartmentFiles), apartmentFilesController.uploadApartment);


export default router;
