import express from 'express';
import * as apartmentController from "../controllers/apartmentControllers.js";
const router = express.Router();

router.post("/apartment", apartmentController.upload, apartmentController.uploadApartment);
router.get(`/allapartment`, apartmentController.getAllApartments);

export default router;
