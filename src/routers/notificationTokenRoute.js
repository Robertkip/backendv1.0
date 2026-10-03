import express from "express";
import {
  notificationDeviceToken,
  searchReceiverToken,
} from "../controllers/notificationTokenController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/store-device-token", Authenticated, notificationDeviceToken);
router.get("/", Authenticated, searchReceiverToken);

export default router;
