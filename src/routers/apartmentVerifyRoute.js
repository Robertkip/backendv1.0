import express from "express";
import { sendVerificationCode, verifyApartmentCreation } from "../controllers/verifyApartmentCreationController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/send-verification-code", Authenticated, sendVerificationCode);
router.post("/verify-apartment-creation", Authenticated, verifyApartmentCreation);

export default router;
