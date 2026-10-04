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

router.get("/propertyaccount/:logent_id", Authorization.Authenticated, apartmentController.getUserProperties);
// Was /property/:agent_id, which /property/:id always shadowed.
router.get("/property/agent/:agent_id", Authorization.Authenticated, apartmentController.getUserProperties);
router.get("/property/:id", Authorization.Authenticated, apartmentController.getApartmentById);

router.put(
  "/property/update/:id",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.updateApartment
);
// Declared before /delete/:id, which would otherwise treat "all" as an id.
router.delete(
  "/property/delete/all",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.deleteAllApartments
);
router.delete("/property/delete/:id", Authorization.Authenticated, apartmentController.deleteApartment);
router.get("/single-property", Authorization.Authenticated, apartmentController.searchApartmentQuery);

router.get("/search-property", Authorization.Authenticated, apartmentController.searchApartmentInPlace);

export default router;
