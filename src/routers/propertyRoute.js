import express from "express";
import * as apartmentController from "../controllers/propertyController.js";
import * as Authorization from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post(
  "/property",
  apartmentController.upload,
  apartmentController.uploadApartment
);
router.get("/allproperty", apartmentController.getAllApartments);

router.get("/property/:id", apartmentController.getApartmentById);
router.get(
  "/propertyaccount/:logent_id",
  apartmentController.getTenantLandlordApartments
);
router.get(
  "/property/:agent_id",
  apartmentController.getTenantLandlordApartments
);

router.put(
  "/property/update/:id",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.updateApartment
);
router.delete("/property/delete/:id", apartmentController.deleteApartment);
router.delete(
  "/property/delete/all",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.deleteAllApartments
);
router.get("/single-property", apartmentController.searchApartmentQuery);

router.get("/search-property", apartmentController.searchApartmentInPlace);

export default router;
