import dotenv from "dotenv";
import twilio from "twilio";
import bcryptjs from "bcryptjs";
import { Op, literal, where } from "sequelize";
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
import Connection from "../models/connectionsModel.js";
import Role from "../models/role.js";

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


// export const Signin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
  
//     const user = await User.findOne({
//       where: { email: email },
//     });


//     const matched = await PasswordHelper.PasswordCompare(
//       password,
//       user.password
//     );


//     console.log("User found", user);  

//     // req.session.user = user;

//     // const sess = req.session.save();

//     if (!user) {
//       return res.status(401).send({ msg: "Unauthorized" });
//     } else if(!matched) {

//       console.log("Password Does Not Match", matched);
//       return res.status(401).send({ msg: "Unauthorized" });
//     } else if (user.verified == false) {
//       return res.status(403).send({ msg: "Verify Account to Login" });
//     } else {

//     const dataUser = {
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       roleId: user.roleId,
//       password: user.password,
//       confirm_password: user.confirm_password,
//       verified: user.verified,
//       active: user.active,
//     };

//     console.log("Role ID Data User is", dataUser.roleId);


//     const role = Role.findByPk(dataUser.roleId);

//     console.log("Role By ID IS", role);

//     const token = Helper.GenerateToken(dataUser);
//     const refreshToken = Helper.GenerateRefreshToken(dataUser);

//     user.accessToken = refreshToken;

//     await user.save();
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     });
  
//     const responseUser = {
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       roleId: role,
//       verified: user.verified,
//       active: user.active,
//       token: token,
//     };
  
//     return res.status(200).send(responseUser);
//   }
//   } catch (err) {
//     console.log("Error Registering Is: " + err.message);
//     res.status(500).send(err);
//   }
// };

export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const matched = await PasswordHelper.PasswordCompare(password, user.password);

    if (!matched) {
      console.log("Password Does Not Match", matched);
      return res.status(401).send({ msg: "Unauthorized" });
    }

    if (user.verified == false) {
      return res.status(403).send({ msg: "Verify Account to Login" });
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

    console.log("Role ID Data User is", dataUser.roleId);

    // Use await to resolve the promise
    const role = await Role.findByPk(dataUser.roleId);

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
      roleId: role, // This will now be the resolved role object
      verified: user.verified,
      active: user.active,
      token: token,
    };

    return res.status(200).send(responseUser);
  } catch (err) {
    console.log("Error Registering Is: " + err.message);
    res.status(500).send(err);
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

    await Otp.destroy({where: {email: req.body.email}});

   return res.status(200).send({message: "Code Verified"});
  
  } else {
    return res.status(500).send({message: "Error Verifying Code"})
  }

}

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


export const updatePassword = async (req, res) => {


}

export const updateUserProfile = async (req, res) => {
   const userId = req.query.id;

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
  const userId = req.query.id;
   const password = req.body.password;
   const confirmPassword = req.body.confirmPassword;


  const user = await User.findOne({
     where: { id: userId },
   });

   try {

   if (!user) {
     return res.status(401).send({ msg: "Unauthorized" });
   } else if (password !== confirmPassword) {
     return res.status(401).send({ msg: "Passwords Do Not Match" });
   
   } else {
   if (password == confirmPassword) {
    await User.update({password: password}, {where: {id: userId}}).then((data) => {
      res.status(201).send(data);
    });
  }
  }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
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
