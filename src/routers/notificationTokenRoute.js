import express from "express";
import { notificationDeviceToken } from "../controllers/notificationTokenController.js";

const router = express.Router();

router.post("/store-device-token", notificationDeviceToken);

export default router;
