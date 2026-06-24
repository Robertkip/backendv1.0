import express from "express";
import { sendVerificationCode, verifyApartmentCreation } from "../controllers/verifyApartmentCreationController.js";

const router = express.Router();

router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-apartment-creation", verifyApartmentCreation);

export default router;
