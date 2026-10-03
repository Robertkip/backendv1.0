import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import { Op, where } from "sequelize";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import multer from "multer";
import path from "path";
import otpGenerator from 'otp-generator';
import { sequelize } from "../config/connectDb.js";
import User from "../models/authModel.js";
import * as PasswordHelper from "../helpers/passwordHelper.js";
import * as Helper from "../helpers/helper.js";
import { canModify, sendForbidden } from "../helpers/ownership.js";
import Otp from "../models/otpModel.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
import Connection from "../models/connectionsModel.js";
import Role from "../models/role.js";
import ejs from 'ejs';
import { fileURLToPath } from 'url';

import { publishEmailJob } from "../rabbitmq/publisher.js";

import AgentProfile from "../models/agentProfileModel.js";
import UserProfile from "../models/userProfileModel.js";

dotenv.config();

// The only roles a user can choose at signup; staff roles are granted separately.
const DEFAULT_ROLE_NAMES = ["USER", "LANDLORD", "AGENT"];

// Bcrypt hashes start with $2a$, $2b$ or $2y$ followed by the cost.
const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value);

const tokenPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  roleId: user.roleId,
  verified: user.verified,
  active: user.active,
});

const ensureDefaultRoles = async () => {
  for (const roleName of DEFAULT_ROLE_NAMES) {
    const existingRole = await Role.findOne({ where: { roleName } });
    if (!existingRole) {
      await Role.create({ roleName, active: true });
    }
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const {
//   GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET,
//   MAILING_SERVICE_REFRESH_TOKEN,
//   SENDER_EMAIL_ADDRESS,
//   SENDER_PASSWORD,
// } = process.env;



// const { OAuth2 } = google.auth;
// const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

// const oauth2Client = new OAuth2(
//   GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET,
//   MAILING_SERVICE_REFRESH_TOKEN,
//   OAUTH_PLAYGROUND
// );
export const Signup = async (req, res) => {
  try {
    await ensureDefaultRoles();

    const { username, email, password, confirm_password, roleId } = req.body;

    // 1. Validate required fields
    if (!email || !password || !confirm_password || !username) {
      return res.status(400).json({ msg: "Please provide all fields" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(422).json({ msg: "Username or Email Already Exists" });
    }

    // 3. Check password match
    if (password !== confirm_password) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const requestedRole = roleId ? await Role.findByPk(roleId) : null;
    const fallbackRole = await Role.findOne({ where: { roleName: "USER" } });
    const resolvedRoleId = DEFAULT_ROLE_NAMES.includes(requestedRole?.roleName)
      ? requestedRole.id
      : (fallbackRole?.id ?? 1);

    // 4. Hash password
    const hashedPassword = bcryptjs.hashSync(password, 8);

    // 5. Create new user
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      active: false,
      verified: false,
      roleId: resolvedRoleId,
      settings: {
        notification: { push: true, email: true },
      },
    });

    // 6. Create user profile
    await UserProfile.create({
      userId: newUser.id,
      user_fname: username,
      user_lname: '',
      user_location: '',
      user_phonenumber: null,
      followers: [],
      following: [],
      user_avatar: '',
      type: '',
    });

    // 7. Generate and save OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({
      email: newUser.email,
      code: otpCode,
      createdAt: new Date(),
      expireIn: expiresAt,
      purpose: "account_verification",
    });

    // 8. Render OTP template (if using your existing welcome.ejs)
    const templatePath = path.join(__dirname, '../templates/layouts/registration-otp.ejs');
    const html = await ejs.renderFile(templatePath, {
      name: newUser.username || 'User',
      otp: otpCode,
      expiryMinutes: 5,
    });

    // 9. Publish email job with pre‑rendered HTML
    await publishEmailJob({
      to: newUser.email,
      subject: 'Verify Your Waridi Account',
      html,        // 👈 rendered HTML
      text: `Your OTP is ${otpCode}. Please verify your email within 5 minutes.`,
    });

    // 10. Respond
    return res.status(201).json({
      message: 'User registered successfully. Please check your email for the OTP.',
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

export const Signin = async (req, res) => {
  try {
    const emailInput = (req.body.email || "").trim().toLowerCase();
    const passwordInput = typeof req.body.password === "string" ? req.body.password : "";

    const user = await User.scope("withPassword").findOne({
      where: { email: emailInput },
    });

    if (!user) {
      return res.status(401).json({
        msg: "Invalid email or password",
        message: "Invalid email or password",
      });
    }

    const storedPassword = user.password || "";
    let matched = await PasswordHelper.PasswordCompare(passwordInput, storedPassword);

    // Older accounts may still hold a plain-text password: accept it once and
    // replace it with a hash. A stored hash is never accepted as the password.
    if (!matched && storedPassword && !isBcryptHash(storedPassword) && storedPassword === passwordInput) {
      user.password = await PasswordHelper.PasswordHashing(passwordInput);
      await user.save();
      matched = true;
    }

    if (!matched) {
      console.log("Password Does Not Match", { email: emailInput, matched: false });
      return res.status(401).json({
        msg: "Invalid email or password",
        message: "Invalid email or password",
      });
    }

    if (user.verified == false) {
      return res.status(403).json({
        msg: "Please verify your account before login.",
        message: "Please verify your account before login.",
      });
    }

    let role = await Role.findByPk(user.roleId);
    if (!role) {
      const fallbackRole = await Role.findOne({ where: { roleName: "USER" } });

      if (fallbackRole) {
        user.roleId = fallbackRole.id;
        await user.save();
        role = fallbackRole;
      } else {
        return res.status(500).json({
          msg: "User role not found.",
          message: "User role not found.",
        });
      }
    }

    if (user.roleId === 2 || user.roleId === 3) {
      const agentProfile = await AgentProfile.findOne({ where: { user_id: user.id } });
      const roleLabel = role.roleName === "LANDLORD" ? "landlord" : "agent";
      if (!agentProfile) {
        const token = Helper.GenerateToken(tokenPayload(user));

        return res.status(200).send({
          message: `Complete your ${roleLabel} onboarding before accessing the dashboard.`,
          onboardingRequired: true,
          id: user.id,
          username: user.username,
          email: user.email,
          roleId: role.roleName,
          verified: user.verified,
          active: user.active,
          token,
        });
      }

      if (agentProfile.agent_verified !== "APPROVED" || !agentProfile.is_agent_verified) {
        return res.status(403).send({
          msg: `Your ${roleLabel} onboarding is pending approval. Dashboard access will be enabled after approval.`,
        });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await Otp.create({
        email: user.email,
        code: otpCode,
        createdAt: new Date(),
        expireIn: expiresAt,
        purpose: "agent_login",
      });

      const otpTemplatePath = path.join(__dirname, "../templates/layouts/agent-login-otp.ejs");
      const html = await ejs.renderFile(otpTemplatePath, {
        name: user.username || "Agent",
        otp: otpCode,
        expiryMinutes: 5,
      });

      await publishEmailJob({
        to: user.email,
        subject: `Your Waridi ${roleLabel} login OTP`,
        html,
        text: `Your ${roleLabel} login OTP is ${otpCode}. It expires in 5 minutes.`,
      });

      return res.status(200).send({
        message: `Login OTP sent to your email. Verify the code to complete ${roleLabel} login.`,
        requiresOtp: true,
        email: user.email,
      });
    }

    const dataUser = tokenPayload(user);

    console.log("Role ID Data User is", dataUser.roleId);
    console.log("Role By ID IS", role);

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
      roleId: role.roleName,
      verified: user.verified,
      active: user.active,
      token: token,
    };

    return res.status(200).json({
      ...responseUser,
      msg: "Login successful",
      message: "Login successful",
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({
      msg: "Unable to sign in. Please try again.",
      message: "Unable to sign in. Please try again.",
    });
  }
};


// oauth2Client.setCredentials({
//   refresh_token: MAILING_SERVICE_REFRESH_TOKEN,
// });

// const accessToken = oauth2Client.getAccessToken();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: SENDER_EMAIL_ADDRESS,
//     pass: SENDER_PASSWORD,
//     clientId: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
//     accessToken,
//   },
// });

// //Testing Success
// transporter.verify((error, success) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Ready for Messages");
//     console.log(success);
//   }
// });


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

};

export const verifyOtpCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const otpRecord = await Otp.findOne({
      where: { email, code, purpose: "account_verification" },
    });

    if (!otpRecord) {
      return res.status(404).json({ message: "Invalid OTP or email not found" });
    }

    const now = new Date();
    const isExpired = otpRecord.expired || (otpRecord.expireIn && now > otpRecord.expireIn);

    if (isExpired) {
      await otpRecord.update({ expired: true });
      return res.status(400).json({ message: "OTP has expired" });
    }

    await User.update({ verified: true }, { where: { email } });

    await otpRecord.destroy();

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyAgentLoginOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const otpRecord = await Otp.findOne({
      where: { email, code, purpose: "agent_login" },
    });

    if (!otpRecord) {
      return res.status(404).json({ message: "Invalid OTP or email not found." });
    }

    const now = new Date();
    const isExpired = otpRecord.expired || (otpRecord.expireIn && now > otpRecord.expireIn);

    if (isExpired) {
      await otpRecord.update({ expired: true });
      return res.status(400).json({ message: "OTP has expired." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found for this email." });
    }

    const agentProfile = await AgentProfile.findOne({ where: { user_id: user.id } });
    if (!agentProfile || agentProfile.agent_verified !== "APPROVED" || !agentProfile.is_agent_verified) {
      return res.status(403).json({ message: "Agent access is not approved. Please wait for verification." });
    }

    const role = await Role.findByPk(user.roleId);
    const dataUser = tokenPayload(user);

    const token = Helper.GenerateToken(dataUser);
    const refreshToken = Helper.GenerateRefreshToken(dataUser);

    user.accessToken = refreshToken;
    await user.save();
    await otpRecord.destroy();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Agent login verified successfully.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role?.roleName || user.roleId,
        verified: user.verified,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Error verifying agent login OTP:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const forgotPassword = async (req, res) => {
  
  const email = req.body.email;

  const user = await User.findOne({
    where: { email: email }
  });

  try {

  if(!user){
    return res.status(401).send({message: "Email Not Found"})
  } else {
    await sendOtpVerification(req.body.email).then(res => {
      console.log("Sender Response Is", res);
    });

    return res.status(200).send({message: "Email Sent"});
  }
} catch (err){
  res.status(500).send({message: err.message})
}
}


export const updateUserProfile = async (req, res) => {
   const userId = req.query.id;
   if (!canModify(req.user, userId)) {
     return sendForbidden(res);
   }

   console.log("Updating user profile Id Is", userId)
   const username = req.body.username;
   const user_avatar = PRODUCTION_IMAGE_ADDRESS + req.file.filename;
   const description = req.body.description;
   
   const user = await User.findOne({
     where: { id: userId },
   });

   if (!user) {
     return res.status(401).send({ msg: "Unauthorized" });
   } else if(user.verified == false) {
       
     return res.status(401).send({ msg: "Please Verify Your Account" });


   } else {
   await User.update({username: username, user_avatar: user_avatar, description: description, 
    type: req.file.mimetype}, {where: {id: userId}}).then((data) => {
    res.status(201).send(data);
    
  });
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
  try {
    const { id } = req.params;
    const { password, confirmPassword } = req.body;

    if (!canModify(req.user, id)) {
      return sendForbidden(res);
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({ msg: "Password fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const hashedPassword = await bcryptjs.hashSync(password, 10);

    await User.update({ password: hashedPassword }, { where: { id } });

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};





export const generateOtp = async () => {
  const Otp = otpGenerator.generate(6, { digits: true, specialChars: false })
}

export const changeImage = async (req, res) => {
  const id = req.params.id;
  if (!canModify(req.user, id)) {
    return sendForbidden(res);
  }
  const user_avatar = PRODUCTION_IMAGE_ADDRESS + req.file.filename;

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
  if (id !== undefined && !/^\d+$/.test(id)) {
    return res.status(400).send({ message: "id must be a number" });
  }
  const condition = id !== undefined ? { id: Number(id) } : null;

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

export const allSocialUsers = async (req, res) => {
  const loggedInUserId = req.query.id;

  try {
     await User.findAll({
      where: {
        id: {
          [Op.ne]: loggedInUserId,
        },
      },
    }).then(user => { 
      console.log("All Social Users Are", user);
       res.status(200).json(user);
    });

  } catch (err) {
    console.error("Error retrieving users", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
}

export const sentConnectionRequest = async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    const selectedUser = await User.findByPk(selectedUserId);

    if (!selectedUser) {
      res.status(404).json({ message: "Selected user not found" });
      return;
    }

    // Ensure connectionsRequest is an array and initialize it if it doesn't exist
    selectedUser.connectionsRequest = selectedUser.connectionsRequest || [];
    
    // Convert IDs to integers before pushing them into the array
    selectedUser.connectionsRequest.push(parseInt(currentUserId, 10));
    await selectedUser.save();

    const currentUser = await User.findByPk(currentUserId);

    if (!currentUser) {
      res.status(404).json({ message: "Current user not found" });
      return;
    }

    // Ensure connectionRequestSent is an array and initialize it if it doesn't exist
    currentUser.connectionRequestSent = currentUser.connectionRequestSent || [];

    // Convert IDs to integers before pushing them into the array
    currentUser.connectionRequestSent.push(parseInt(selectedUserId, 10));
    await currentUser.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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

export const receivedConnectionRequest = async (req, res) => {
  const { senderId, recepientId } = req.body;

  try {
    // Retrieve the documents of sender and the recipient
    const sender = await User.findByPk(senderId);
    const recepient = await User.findByPk(recepientId);


    // Check if both sender and recepient exist
    if (!sender || !recepient) {
      res.status(404).json({ message: "Sender or recepient not found" });
      return;
    }

    console.log('Initial state:');
    console.log('Sender connections:', sender.connections);
    console.log('Recepient connections:', recepient.connections);


    await Connection.create({userId: senderId, connectionId: recepientId})
    await Connection.create({userId: recepientId, connectionId: senderId})

    // Initialize the connections arrays if they're null or undefined
    // sender.connections = sender.connections || [];
    // recepient.connections = recepient.connections || [];

    // Update the friends arrays
    // sender.connections.push(recepientId);
    // recepient.connections.push(senderId);

    // Filter and update friend requests arrays
    recepient.connectionsRequest = recepient.connectionsRequest.filter(request => request !== senderId);
    sender.connectionRequestSent = sender.connectionRequestSent.filter(request => request !== recepientId);

    console.log('Sender connections:', sender.connections);
    console.log('Recepient connections:', recepient.connections);

    // Update connections field
    // if (!sender.connections.includes(recepientId)) {
    //   sender.connections.push(recepientId);
    // }

    // if (!recepient.connections.includes(senderId)) {
    //   recepient.connections.push(senderId);
    // }


    // Save changes
    await Promise.all([sender.save(), recepient.save()]);

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getConnections = async (req, res) => {
  const userId = req.query.id;

  try {
    const connections = await sequelize.query(
      `
      SELECT
          c."connectionId",
          u.id,
          u.username,
          u.email,
          u.user_avatar
      FROM
          "Connections" c
      LEFT JOIN
          "Users" u ON c."connectionId" = u.id
      WHERE
          c."userId" = :userId
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({ connections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// export const followingUser = async (req, res) => {
//   try {
//     const userToFollow = await User.findByPk(req.params.id);
//     const loggedInUser = await User.findByPk(req.user.id);
//     if (!userToFollow) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     //If user is following himself
//     if (userToFollow.id === loggedInUser.id) {
//       return res.status(400).json({
//         message: "You cannot follow yourself",
//         success: false,
//       });
//     }
//     if (loggedInUser.following.includes(userToFollow.id)) {
//       const indexFollowing = loggedInUser.following.indexOf(userToFollow.id);
//       loggedInUser.following.splice(indexFollowing, 1);
//       const indexFollowers = userToFollow.followers.indexOf(loggedInUser.id);
//       userToFollow.followers.splice(indexFollowers, 1);

//       await loggedInUser.save();
//       await userToFollow.save();

//       return res.status(200).json({
//         success: true,
//         message: "User Unfollowed",
//       });
//     } else {
//       loggedInUser.following.push(userToFollow.id);
//       userToFollow.followers.push(loggedInUser.id);

//       await loggedInUser.save();
//       await userToFollow.save();

//       return res.status(200).json({
//         success: true,
//         message: "User Followed",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };


export const userConnections = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by their primary key
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const acceptedFriends = user.connections; // Assuming 'friends' is a field in your User model

    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}




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
