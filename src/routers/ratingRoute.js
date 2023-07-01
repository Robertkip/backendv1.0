import express from "express";
import * as ratingController from "../controllers/ratingController.js";

const router = express.Router();

router.post("/rating", ratingController.addRating);
router.get("/rating/:itemId", ratingController.getAverageRating);

export default router;
