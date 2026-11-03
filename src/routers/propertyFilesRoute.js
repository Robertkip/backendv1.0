import express from 'express';
import * as propertyFilesController from '../controllers/propertyFilesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';
import { validateBody } from '../middlewares/validate.js';
import * as schemas from '../validation/schemas.js';

const router = express.Router();

router.post('/addfiles', Authenticated, propertyFilesController.upload, validateBody(schemas.uploadPropertyFiles), propertyFilesController.uploadApartment);



export default router;