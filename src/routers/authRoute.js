import express from "express";
import passport from "passport";
import {
  Signup,
  Signin,
  getAllUsers,
  changePassword,
  changeImage,
  upload,
  getSingleUser,
  verifyOtpCode,
  verifyAgentLoginOtp,
  sentConnectionRequest,
  receivedConnectionRequest,
  userConnections,
  allSocialUsers,
  updateUserProfile,
  forgotPassword,
} from "../controllers/authController.js";

import * as authController from "../controllers/authController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

const CLIENT_URL = "https://api.waridi.org/";

router.post("/signup", Signup);
router.post("/signin", Signin);
router.put("/updateprofile/", Authenticated, authController.upload, updateUserProfile);
router.post("/verify", verifyOtpCode);
router.post("/verify-agent-login", verifyAgentLoginOtp);
router.put("/changepassword/:id", Authenticated, changePassword);
router.post("/forgotpassword", forgotPassword);
router.get("/users", Authenticated, getAllUsers);
router.get("/get-single-user", Authenticated, getSingleUser);
router.get("/social-users/", Authenticated, allSocialUsers);
router.post("/send-connection-request", Authenticated, sentConnectionRequest);
router.post("/receive-connection-request", Authenticated, receivedConnectionRequest);
router.get("/get-connections/", Authenticated, authController.getConnections);
router.get("/user-connections:/id", Authenticated, userConnections);
router.put("/user/:id", Authenticated, upload, changeImage);
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

export default router;
