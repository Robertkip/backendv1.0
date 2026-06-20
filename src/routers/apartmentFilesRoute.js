import express from 'express';
import * as apartmentFilesController from '../controllers/apartmentFilesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addfiles', Authenticated, apartmentFilesController.upload, apartmentFilesController.uploadApartment);


export default router;
