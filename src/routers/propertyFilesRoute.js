import express from 'express';
import * as propertyFilesController from '../controllers/propertyFilesController.js';

router.post('/addfiles', propertyFilesController.upload, propertyFilesController.uploadApartment);


const router = express.Router();


export default router;