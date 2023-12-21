import dotenv from "dotenv";
import twilio from "twilio";
import bcryptjs from "bcryptjs";
import { Op, literal } from "sequelize";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import multer from "multer";
import path from "path";
import otpGenerator from 'otp-generator';
import { sequelize } from "../config/connectDb.js";
import User from "../models/authModel.js";
import * as PasswordHelper from "../helpers/passwordHelper.js";
import * as Helper from "../helpers/helper.js";
import Otp from "../models/otpModel.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_SID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
  SENDER_PASSWORD,
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});


const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

const oauth2Client = new OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);
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

    let optuser = await Otp.findOne({
      where: {email}
    })
    const settings = {
      notification: {
        push: true,
        email: true,
      },
    };

    if (!req.body.email) {
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

      await sendOtpVerification(req.body.email).then(res => {
        console.log("Sender Response Is", res);
      });


      const newUser = new User({
        email: email,
        username: username,
        password: bcryptjs.hashSync(password, 8),
        active: active,
        verified: verified,
        roleId: roleId,
        settings,
      });


     await newUser.save();
      // .then((res) => {
      //   console.log("Response After Saving Is", res);
      //   sendOtpVerification(res.dataValues.email);
      // });     

      return res.status(201).send(newUser);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    req.session.user = user;
    const sess = req.session.save();
    console.log("Session is", sess);
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

oauth2Client.setCredentials({
  refresh_token: MAILING_SERVICE_REFRESH_TOKEN,
});

const accessToken = oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: SENDER_EMAIL_ADDRESS,
    pass: SENDER_PASSWORD,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
    accessToken,
  },
});

//Testing Success
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for Messages");
    console.log(success);
  }
});

export const sendOtpVerification = async (email) => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;


  console.log("Sender Email Address Is", email);

  //Mail Options
  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Enter <b> ${otp} </> To verify Account. </p>`,
  };

  // Hash the Otp
  // const saltRounds = 10;

  // const hashedOTP = await bcryptjs.hash(otp, saltRounds);

  const newOTPVerification = await new Otp({
    email: email,
    code: otp,
    createdAt: Date.now(),
    expireIn: Date.now() + 360000,
  });

  await newOTPVerification.save();
  await transporter.sendMail(mailOptions).then((res) => {
    console.log("Email Response is", res);
  });
  // res.json({
  //   status: "PENDING",
  //   message: "Verification OTP Email Sent",
  //   data: {
  //     email,
  //   },
  // });
};

export const verifyOtpCode = async (req, res) => {
 
  const useremail = await Otp.findOne({
    where: { email: req.body.email }
});

  console.log("Email From Otp Is", useremail);



  const usercode = await Otp.findOne({
    where: {
    code: req.body.code
  }
  });

  
  console.log("Code From Otp Is", usercode);
  

  if (req.body.email != useremail.dataValues.email) {
    return res.status(500).send({message: "Email Not Found"})
  } else if(req.body.code != usercode.dataValues.code) {
    return res.status(400).send({message: "Code does not match"})
  } else if(usercode.dataValues.code == req.body.code) {
    await User.update({verified: true}, {where: {email: req.body.email}})

   return res.status(200).send({message: "Code Verified"});
  
  } else {
    return res.status(500).send({message: "Error Verifying Code"})
  }


}

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
    let currentTime = new Date();

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

// export const sendSmS = async (req, res) => {
//   const {phoneNumber} = req.body;

//   console.log("Phone Number Is", phoneNumber);
//   const result = await textflow.sendVerificationSMS(phoneNumber);

//   if (result.ok)
//   return res.status(200).json({ success: true });

//    return res.status(400).json(res);

// }



export const generateOtp = async () => {
  const Otp = otpGenerator.generate(6, { digits: true, specialChars: false })
}

export const changeImage = async (req, res) => {
  const id = req.params.id;
  const user_avatar = "https://api.waridi.co/images/" + req.file.filename;

  await User.findOne({ where: { id: id } }).then((updateImage) => {
    updateImage
      .update({
        description: req.body.description,
        dateofbirth: req.body.dateofbirth,
        user_avatar: user_avatar,
        type: req.file.mimetype,
      })
      .then(() => {
        res.status(200).send({ updateImage });
      })
      .catch((error) => {
        res.status(500).send({ msg: "Error Occurrs" });
      });
  });
};

export const getSingleUser = async (req, res, next) => {
  // Retrieve all Tutorials from the database.

  const id = req.query.id;
  var condition = id
    ? {
        [Op.and]: [
          literal(`CAST("id" AS TEXT) LIKE '%${id}%'`),
          literal(`"id" IS NOT NULL`),
        ],
      }
    : null;

  await User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Users.",
      });
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

export const followingUser = async (req, res) => {
  try {
    const userToFollow = await User.findByPk(req.params.id);
    const loggedInUser = await User.findByPk(req.user.id);
    if (!userToFollow) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    //If user is following himself
    if (userToFollow.id === loggedInUser.id) {
      return res.status(400).json({
        message: "You cannot follow yourself",
        success: false,
      });
    }
    if (loggedInUser.following.includes(userToFollow.id)) {
      const indexFollowing = loggedInUser.following.indexOf(userToFollow.id);
      loggedInUser.following.splice(indexFollowing, 1);
      const indexFollowers = userToFollow.followers.indexOf(loggedInUser.id);
      userToFollow.followers.splice(indexFollowers, 1);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        message: "User Unfollowed",
      });
    } else {
      loggedInUser.following.push(userToFollow.id);
      userToFollow.followers.push(loggedInUser.id);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        message: "User Followed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg||jpg||png||gif/;
    const mimeTypes = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeTypes && extname) {
      cb(null, true);
    } else {
      cb("Please Upload the correct file Type");
    }
  },
}).single("image");
