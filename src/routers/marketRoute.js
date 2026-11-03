import express from "express";
import * as marketController from "../controllers/marketController.js";
import * as Authorization from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/market", Authorization.Authenticated, marketController.upload, validateBody(schemas.createMarket), marketController.createMarket);
router.get("/allmarket", marketController.getMarket);
// Declared before /delete/:id, which would otherwise treat "all" as an id.
router.delete(
  "/market/delete/all",
  Authorization.Authenticated,
  Authorization.AdminRole,
  marketController.deleteAllMarket
);
router.delete("/market/delete/:id", Authorization.Authenticated, marketController.deleteMarket);
router.get("/marketproducts/:sellerId", marketController.getMarketBySellerId);

export default router;
