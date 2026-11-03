import express from "express";
import * as notificationController from "../controllers/notifyController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/register", Authenticated, validateBody(schemas.registerPushToken), notificationController.registerToken);
router.post("/send-notification", Authenticated, validateBody(schemas.sendNotification), notificationController.sendTokenInformation);
router.get("/get-notification", Authenticated, notificationController.getUserNotifications)

export default router;
