import express from "express";
import * as userProfileController from "../controllers/userController.js";

const router = express.Router();

router.post(
  "/userprofile",
  userProfileController.upload,
  userProfileController.createUserProfile
);
router.get("/alluserprofile", userProfileController.getUserProfile);
router.get("/userprofile/:id", userProfileController.getUserById);
router.get("/singleuser/:userId", userProfileController.getSingleUser);

export default router;
