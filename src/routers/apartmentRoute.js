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

router.get("/userapartment", Authorization.Authenticated, apartmentController.getApartmentByUser);
router.get("/user-apartments", Authorization.Authenticated, apartmentController.getApartmentByUser);
router.get("/apartments", apartmentController.getAllRentals);
router.get("/rentals", apartmentController.getAllRentals);
router.get("/allapartment/", apartmentController.getAllApartments);
router.get("/allapartment", apartmentController.getAllApartments);

router.get("/apartment/:id", apartmentController.getApartmentById);

router.get(
  "/apartmentaccount/:logent_id",
  apartmentController.getLandlordApartments
);

router.get(
  "/apartmentaccount/:logent_id",
  apartmentController.getAgentApartments
);

router.put(
  "/apartment/update/:id",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.updateApartment
);
router.delete("/apartment/delete/:id", Authorization.Authenticated, apartmentController.deleteApartment);
router.delete(
  "/apartment/delete/all",
  Authorization.Authenticated,
  Authorization.AdminRole,
  apartmentController.deleteAllApartments
);
router.get("/single-apartment", apartmentController.searchApartmentQuery);

router.get("/search-apartment", apartmentController.searchApartmentInPlace);

export default router;
