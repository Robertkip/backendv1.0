import express from 'express';
import * as propertyFilesController from '../controllers/propertyFilesController.js';

const router = express.Router();

router.post('/addfiles', propertyFilesController.upload, propertyFilesController.uploadApartment);



export default router;