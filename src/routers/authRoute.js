import express from "express";
import passport from "passport";
import {
  Signup,
  Signin,
  getAllUsers,
  sendOtp,
  verifyOTP,
  changePassword,
  changeImage,
  upload,
  getSingleUser,
  verifyOtpCode
} from "../controllers/authController.js";

const router = express.Router();

const CLIENT_URL = "https://api.waridi.co/";

router.post("/signup", Signup);
router.post("/signin", Signin);
router.get("/send/:to", sendOtp);
// router.get("/verify/:to/:code", verifyOTP);
router.get("/verify", verifyOtpCode);
router.post("/changepassword", changePassword);
router.get("/users", getAllUsers);
router.get("/get-single-user", getSingleUser);
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
