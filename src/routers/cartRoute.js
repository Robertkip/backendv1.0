import express from "express";
import * as cartController from "../controllers/cartItemController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/cart/:productId", Authenticated, cartController.postCartItem);
router.get("/allcart", Authenticated, cartController.getCartItems);
router.delete("/cart/:productId", Authenticated, cartController.removeCartItem);
router.put("/cart/:id", Authenticated, cartController.updateQuantity);

export default router;
