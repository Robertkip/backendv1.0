import express from "express";
import * as ratingController from "../controllers/ratingController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/rating", Authenticated, validateBody(schemas.addRating), ratingController.addRating);
router.get("/rating/:itemId", Authenticated, ratingController.getAverageRating);

export default router;
