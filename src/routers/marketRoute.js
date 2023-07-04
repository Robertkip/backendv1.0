import express from "express";
import * as marketController from "../controllers/marketController.js";

const router = express.Router();

router.post("/market", marketController.upload, marketController.createMarket);
router.get("/allmarket", marketController.getMarket);
router.delete("/market/delete/:id", marketController.deleteMarket);
router.delete(
  "/apartment/delete/all",
  Authorization.Authenticated,
  Authorization.AdminRole,
  marketController.deleteAllMarket
);
router.get("/marketproducts/:sellerId", marketController.getMarketBySellerId);

export default router;
