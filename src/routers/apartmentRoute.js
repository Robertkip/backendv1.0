import express from 'express';
import * as apartmentController from "../controllers/apartmentControllers.js";
import upload from '../middlewares/uploadImage.js';

const router = express.Router();

router.post("/apartment", upload.single("file"), apartmentController.apartmentUpload);
router.get(`/allapartment`, apartmentController.getAllApartments);

export default router;
