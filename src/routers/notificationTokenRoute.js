import express from "express";
import {
  notificationDeviceToken,
  searchReceiverToken,
} from "../controllers/notificationTokenController.js";

const router = express.Router();

router.post("/store-device-token", notificationDeviceToken);
router.get("/", searchReceiverToken);

export default router;
