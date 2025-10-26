import express from 'express';
import * as apartmentFilesController from '../controllers/apartmentFilesController.js';

router.post('/addfiles', apartmentFilesController.upload, apartmentFilesController.uploadApartment);


const router = express.Router();


export default router;