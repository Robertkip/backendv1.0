import express from "express";
import * as userProfileController from "../controllers/userController.js";

import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post(
  "/userprofile",
  Authenticated,
  userProfileController.upload,
  validateBody(schemas.createUserProfile),
  userProfileController.createUserProfile
);
router.get("/alluserprofile", Authenticated, userProfileController.getUserProfile);
router.get("/userprofile/:id", Authenticated, userProfileController.getUserById);
router.get("/singleuser/:userId", Authenticated, userProfileController.getSingleUser);

router.get("/", Authenticated, userProfileController.searchUserQuery);

export default router;
