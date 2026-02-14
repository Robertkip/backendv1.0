import express from "express";
import * as RentPriceController from "../controllers/rentPriceController.js";

import * as Authorization from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post(
  "/rent-price",
  Authorization.Authenticated,
  RentPriceController.CreateRentPrice
);
router.get("/by-apartment/:id", RentPriceController.getRentPriceByApartmentId);

router.put("/rent-price/:id", RentPriceController.updateRentPrice);

router.delete("/rent-price/:id", RentPriceController.deleteRentPrice);

export default router;
