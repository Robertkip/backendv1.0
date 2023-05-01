import dotenv from "dotenv";
import twilio from "twilio";
import bcryptjs from "bcryptjs";
import { Op } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import User from "../models/authModel.js";
import * as PasswordHelper from "../helpers/passwordHelper.js";
import * as Helper from "../helpers/helper.js";
import Otp from "../models/otpModel.js";
dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

export const Signup = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const active = req.body.active;
    const verified = req.body.verified;
    const roleId = req.body.roleId;

    let user = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    const settings = {
      notification: {
        push: true,
        email: true,
      },
    };

    if (!req.body.email || !req.body.password || !req.body.username) {
      res.status(400).send({
        msg: "Please provide all fields",
      });
    } else if (user) {
      res.status(422).send({ msg: "Username or Email Already Exists" });
    } else if (password !== confirm_password) {
      console.log("Passwords Do not Match");
    } else if (!email || !password || !confirm_password) {
      console.log("Please Provide All Fields");
    } else {
      User.create({
        email: email,
        username: username,
        password: bcryptjs.hashSync(password, 8),
        active: active,
        verified: verified,
        roleId: roleId,
        settings,
      }).then((user) => {
        return res.status(201).send(user);
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const matched = await PasswordHelper.PasswordCompare(
      password,
      user.password
    );
    if (!matched) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const dataUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      password: user.password,
      confirm_password: user.confirm_password,
      verified: user.verified,
      active: user.active,
    };

    const token = Helper.GenerateToken(dataUser);
    const refreshToken = Helper.GenerateRefreshToken(dataUser);

    user.accessToken = refreshToken;

    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      verified: user.verified,
      active: user.active,
      token: token,
    };

    return res.status(200).send(responseUser);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });
  } catch (error) {}
};

export const emailSend = async () => {
  let data = await User.findOne({ email: req.body.email });
  const responseType = {};
  if (data) {
    let otpcode = Math.floor(Math.random() * 10000 + 1);
    let otpData = new Otp({
      email: req.body.email,
      code: otpcode,
      expireIn: new Date().getTime() + 300 * 1000,
    });
    let otpResponse = await otpData.save();
    responseType.statusText = "Success";
    responseType.message = "Please check Your Email Id";
  } else {
    responseType.statusText = "Error";
    responseType.statusText = "Email Id Not Exist";
  }
  res.status(200).json("Ok");
};

export const changePassword = async (req, res) => {
  let data = await Otp.findOne({
    email: req.body.email,
    code: req.body.otpCode,
  });
  const response = {};
  if (data) {
    let currentTime = new Date.now();

    let diff = data.expireIn - currentTime;

    if (diff < 0) {
      response.message = "Verification Code has Expired";
      response.statusText = "error";
    } else {
      let user = await Otp.findOne({ email: req.body.email });
      user.password = req.body.password;
      user.save();

      response.message = "Password Changed Successfully";
      response.statusText = "Success";
    }
  } else {
    response.message = "Invalid Verification Code";
    response.statusText = "error";
  }

  res.status(200).json(response);
};

// export const sendOtp = async () => {
//   const {countryCode, phoneNumber} = req.body;
//   try {
//       const otpResponse = await client.verify
//       .services(TWILIO_SERVICE_SID)
//       .verifications.create({
//           to: `+${countryCode}${phoneNumber}`,
//           channel: "sms",
//       });
//       res.status(200).send(`OTP send successfully!: ${JSON.stringify(otpResponse)}`);
//   } catch (error) {
//       res.status(error?.status || 400).send(error?.message || 'Something went wrong');
//   }
// };

// export const verifyOTP = async (req, res, next) => {
//   const {countryCode, phoneNumber, otp} = req.body;
//   try {
//       const verifiedResponse = await client.verify.services(TWILIO_SERVICE_SID)
//       .verificationChecks.create({
//           to: `+${countryCode}${phoneNumber}`,
//           code: otp
//       });
//      res.status(200).send(`OTP verified successfully!: ${JSON.stringify(verifiedResponse)}`);
//   } catch(error) {
//      res.status(error?.status || 400).send(error?.message || `Something went wrong`);
//   }
// }

export const sendOtp = async (req, res) => {
  const to = req.params.to;
  client.verify
    .services(TWILIO_SERVICE_SID)
    .verifications.create({ to, channel: "sms" })
    .then((verification) => {
      res.json(verification);
    })
    .catch((err) => {
      res.json(err);
    });
};

export const verifyOTP = async (req, res, next) => {
  const to = req.params.to;
  const code = req.params.code;

  client.verify
    .services(TWILIO_ACCOUNT_SID)
    .verificationChecks.create({ to, code })
    .then((res) => {
      res.status(200).send({ msg: "Phone Verified Successfully" });
    })
    .catch((err) => {
      res.json(err);
    });
};

export const followUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const followUser = await User.findOne(id);
      const followingUser = await User.findOne(currentUserId);

      if (!followUser.followers.includes(currentUserId)) {
        await followUser.update({ followers: currentUserId });
        await followingUser.update({ following: id });
        res.status(200).json("User Followed!");
      } else {
        res.status(403).json("User is Already followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

export const unfollowUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const followUser = await User.findOne(id);
      const followingUser = await User.findOne(currentUserId);

      if (followUser.followers.includes(currentUserId)) {
        await followUser.update({ followers: currentUserId });
        await followingUser.update({ followers: id });
      } else {
        res.status(403).json("User is not followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// export const registerFollower = async () => {
//   if (req.body.userId !== req.params.id) {
//     try {
//       const user = await User.findByPk(req.params.id);
//       const currentUser = await User.findByPk(req.body.userId);

//       if (!user.followers.includes(req.body.userId)) {
//         await user.update({ followings: sequelize.fn("") });
//       }
//     } catch (error) {}
//   }
// };
