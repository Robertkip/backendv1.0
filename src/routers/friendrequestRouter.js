import express from "express";
import { postFriendRequest } from "../controllers/friendRequestController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/friend", Authenticated, postFriendRequest);

export default router;
