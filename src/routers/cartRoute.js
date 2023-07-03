import express from "express";
import * as cartController from "../controllers/cartItemController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.use(Authenticated);


router.post("/cart/:productId", cartController.postCartItem);
router.get("/allcart", cartController.getCartItems);
router.delete("/cart/:productId", cartController.removeCartItem);
router.put("/cart/:id", cartController.updateQuantity);

export default router;
