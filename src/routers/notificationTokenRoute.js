import express from "express";
import {
  notificationDeviceToken,
  searchReceiverToken,
} from "../controllers/notificationTokenController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/store-device-token", Authenticated, validateBody(schemas.storeDeviceToken), notificationDeviceToken);
router.get("/", Authenticated, searchReceiverToken);

export default router;
