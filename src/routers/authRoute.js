import express from "express";
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
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.get("/send/:to", sendOtp);
router.get("/verify/:to/:code", verifyOTP);
router.post("/changepassword", changePassword);
router.get("/users", getAllUsers);
router.get("/get-single-user", getSingleUser);
router.put("/user/:id", upload, changeImage);

export default router;
