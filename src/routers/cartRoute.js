import express from "express";
import * as cartController from "../controllers/cartItemController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/cart/:productId", Authenticated, cartController.postCartItem);
router.get("/allcart", Authenticated, cartController.getCartItems);
router.delete("/cart/:productId", Authenticated, cartController.removeCartItem);
router.put("/cart/:id", Authenticated, validateBody(schemas.updateCartQuantity), cartController.updateQuantity);

export default router;
