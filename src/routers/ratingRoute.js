import express from "express";
import * as ratingController from "../controllers/ratingController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/rating", Authenticated, ratingController.addRating);
router.get("/rating/:itemId", Authenticated, ratingController.getAverageRating);

export default router;
