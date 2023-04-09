import express from "express";
import * as apartmentController from "../controllers/apartmentControllers.js";
import * as Authorization from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post(
  "/apartment",
  Authorization.Authenticated,
  apartmentController.upload,
  apartmentController.uploadApartment
);
router.get("/allapartment", apartmentController.getAllApartments);

router.get("/apartment/:id", apartmentController.getApartmentById);
router.get(
  "/apartmentaccount/:logent_id",
  apartmentController.getTenantLandlordApartments
);
router.get(
  "/apartment/:agent_id",
  apartmentController.getTenantLandlordApartments
);

router.put(
  "/apartment/update/:id",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.updateApartment
);
router.delete("/apartment/delete/:id", apartmentController.deleteApartment);
router.delete(
  "/apartment/delete/all",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.deleteAllApartments
);
router.get("/", apartmentController.searchApartmentQuery);

export default router;
