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
  sentConnectionRequest,
  receivedConnectionRequest,
  userConnections,
  allSocialUsers,
  updateUserProfile,
  forgotPassword,
} from "../controllers/authController.js";

import * as authController from "../controllers/authController.js";

const router = express.Router();

const CLIENT_URL = "https://api.waridi.org/";

router.post("/signup", Signup);
router.post("/signin", Signin);
router.put("/updateprofile/", authController.upload, updateUserProfile);
router.post("/verify", verifyOtpCode);
router.put("/changepassword/:id", changePassword);
router.post("/forgotpassword", forgotPassword);
router.get("/users", getAllUsers);
router.get("/get-single-user", getSingleUser);
router.get("/social-users/", allSocialUsers);
router.post("/send-connection-request", sentConnectionRequest);
router.post("/receive-connection-request", receivedConnectionRequest);
router.get("/get-connections/", authController.getConnections);
router.get("/user-connections:/id", userConnections);
router.put("/user/:id", upload, changeImage);
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
