import express from "express";
import * as cartController from "../controllers/cartItemController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.use(Authenticated);

router.post("/cart", cartController.postCartItem);
router.get("/allcart", cartController.getCartItem);
router.delete("/cart/:id", cartController.deleteCartItem);

export default router;
