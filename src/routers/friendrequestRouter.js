import express from "express";
import { postFriendRequest } from "../controllers/friendRequestController.js";

const router = express.Router();

router.post("/friend", postFriendRequest);

export default router;
