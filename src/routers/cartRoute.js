import express from 'express';
import * as cartController from "../controllers/cartItemController.js";

const router = express.Router();

router.post('/cart', cartController.postCartItem);
router.get('/allcart', cartController.getCartItem);
router.delete('/cart/:id', cartController.deleteCartItem);

export default router;
