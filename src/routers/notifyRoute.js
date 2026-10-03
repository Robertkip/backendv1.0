import express from "express";
import * as notificationController from "../controllers/notifyController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/register", Authenticated, notificationController.registerToken);
router.post("/send-notification", Authenticated, notificationController.sendTokenInformation);
router.get("/get-notification", Authenticated, notificationController.getUserNotifications)

export default router;
