import express from "express";
import {
  Signup,
  Signin,
  getAllUsers,
  sendOtp,
  verifyOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.get("/send/:to", sendOtp);
router.get("/verify/:to/:code", verifyOTP);
router.get("/users", getAllUsers);

export default router;
