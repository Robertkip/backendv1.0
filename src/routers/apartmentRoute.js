import express from 'express';
import * as apartmentController from "../controllers/apartmentControllers.js";
const router = express.Router();

router.post("/apartment", apartmentController.upload, apartmentController.uploadApartment);
router.get(`/allapartment`, apartmentController.getAllApartments);

router.get('/apartment/:id', apartmentController.getApartmentById);
router.get('/apartmentaccount/:logent_id', apartmentController.getTenantLandlordApartments);
router.get('/apartment/:agent_id', apartmentController.getTenantLandlordApartments);

export default router;
