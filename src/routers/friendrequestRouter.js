import express from "express";
import { postFriendRequest } from "../controllers/friendRequestController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/friend", Authenticated, validateBody(schemas.friendRequest), postFriendRequest);

export default router;
