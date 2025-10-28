import express from 'express';
import * as apartmentFilesController from '../controllers/apartmentFilesController.js';

const router = express.Router();

router.post('/addfiles', apartmentFilesController.upload, apartmentFilesController.uploadApartment);


export default router;
