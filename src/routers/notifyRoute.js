import express from "express";
import * as notificationController from "../controllers/notifyController.js";

const router = express.Router();

router.post("/register", notificationController.registerToken);
router.post("/send-notification", notificationController.sendTokenInformation);

export default router;
