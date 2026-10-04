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
router.post("/resetpassword", authController.resetPassword);
router.get("/users", Authenticated, getAllUsers);
router.get("/get-single-user", Authenticated, getSingleUser);
router.get("/social-users/", Authenticated, allSocialUsers);
router.post("/send-connection-request", Authenticated, sentConnectionRequest);
router.post("/receive-connection-request", Authenticated, receivedConnectionRequest);
router.get("/get-connections/", Authenticated, authController.getConnections);
router.get("/user-connections/:id", Authenticated, userConnections);
router.put("/user/:id", Authenticated, upload, changeImage);
// Social sign-in only works when its strategy was registered (see
// middlewares/initPassport.js); otherwise answer 503 instead of crashing.
const socialLogin = (strategy, options) => (req, res, next) => {
  if (!passport._strategy(strategy)) {
    return res.status(503).json({ message: `${strategy} sign-in is not configured on this server` });
  }
  return passport.authenticate(strategy, options)(req, res, next);
};

router.get("/google", socialLogin("google", { scope: ["profile"] }));
router.get("/facebook", socialLogin("facebook", { scope: ["profile"] }));
router.get(
  "/google/callback",
  socialLogin("google", { successRedirect: CLIENT_URL, failureRedirect: "/login/failed" })
);
router.get(
  "/facebook/callback",
  socialLogin("facebook", { successRedirect: CLIENT_URL, failureRedirect: "/login/failed" })
);

export default router;
