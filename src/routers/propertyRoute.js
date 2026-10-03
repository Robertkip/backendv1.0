import express from "express";
import * as apartmentController from "../controllers/propertyController.js";
import * as Authorization from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post(
  "/property",
  Authorization.Authenticated,
  apartmentController.upload,
  apartmentController.uploadApartment
);
router.get("/allproperty", Authorization.Authenticated, apartmentController.getAllProperties);
router.get("/properties", Authorization.Authenticated, apartmentController.getAllProperties);
router.get("/lands", Authorization.Authenticated, apartmentController.getAllProperties);
router.get("/allproperty/", Authorization.Authenticated, apartmentController.getAllProperties);

router.get("/property/:id", Authorization.Authenticated, apartmentController.getApartmentById);
router.get(
  "/propertyaccount/:logent_id",
  Authorization.Authenticated,
  apartmentController.getTenantLandlordApartments
);
router.get(
  "/property/:agent_id",
  Authorization.Authenticated,
  apartmentController.getTenantLandlordApartments
);

router.put(
  "/property/update/:id",
 Authorization.Authenticated,
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.updateApartment
);
router.delete("/property/delete/:id", Authorization.Authenticated, apartmentController.deleteApartment);
router.delete(
  "/property/delete/all",
 Authorization.Authenticated,
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.deleteAllApartments
);
router.get("/single-property", Authorization.Authenticated, apartmentController.searchApartmentQuery);

router.get("/search-property", Authorization.Authenticated, apartmentController.searchApartmentInPlace);

export default router;
