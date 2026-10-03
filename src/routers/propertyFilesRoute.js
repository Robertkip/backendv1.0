import express from 'express';
import * as propertyFilesController from '../controllers/propertyFilesController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/addfiles', Authenticated, propertyFilesController.upload, propertyFilesController.uploadApartment);



export default router;