import express from "express";
import { sendVerificationCode, verifyApartmentCreation } from "../controllers/verifyApartmentCreationController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/send-verification-code", Authenticated, sendVerificationCode);
router.post("/verify-apartment-creation", Authenticated, validateBody(schemas.verifyApartmentCreation), verifyApartmentCreation);

export default router;
