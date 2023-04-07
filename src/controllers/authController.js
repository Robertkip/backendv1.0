import dotenv from 'dotenv';
import twilio from 'twilio';
import bcryptjs from 'bcryptjs';
import { Op } from 'sequelize';
import User from "../models/authModel.js";
import * as PasswordHelper from "../helpers/passwordHelper.js";
import * as Helper from "../helpers/helper.js";
dotenv.config();

const {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})

export const Signup = async (req, res) => {
    try {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const confirm_password = req.body.confirm_password;
      const active = req.body.active;
      const verified = req.body.verified;
      const roleId = req.body.roleId

      let user = await User.findOne({where: {[Op.or]: [{username}, {email}]}});

      const settings = {
        notification: {
            push: true,
            email: true
        }
      }

      if(!req.body.email || !req.body.password || !req.body.username) {
        res.status(400).send({
            msg: 'Please provide all fields'
        })
      } else if (user) {
           res.status(422).send({msg: "Username or Email Already Exists"});
      } else 
      if(password !== confirm_password) {
        console.log("Passwords Do not Match")
    } else if(!email || !password || !confirm_password) {
       console.log("Please Provide All Fields")
    } else {
          User.create({
                email: email,
                username: username,
                password: bcryptjs.hashSync(password, 8),
                active: active,
                verified: verified,
                roleId: roleId,
                settings
               }).then(user => {
                return res.status(201).send(user);
               })   
     }
  } catch (err) {
       res.status(500).send({message: err.message});
    }
  }
  
  export const Signin = async (req, res) => {
      try {
        const {email, password} = req.body;
         const user = await User.findOne({
              where: {email: email}
          })
          if(!user) {
            return res.status(401).send({msg: "Unauthorized"});
          }

          const matched = await PasswordHelper.PasswordCompare(password, user.password);
          if(!matched){
            return res.status(401).send({msg: "Unauthorized"});
          }

          const dataUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            roleId: user.roleId,
            password: user.password,
            confirm_password: user.confirm_password,
            verified: user.verified,
            active: user.active
          }

          const token = Helper.GenerateToken(dataUser);
          const refreshToken = Helper.GenerateRefreshToken(dataUser);

          user.accessToken = refreshToken;


          await user.save();
          res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000
		});

    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      verified: user.verified,
      active: user.active,
      token: token,
    }

        return res.status(200).send(responseUser);

      } catch (err) {
          res.status(500).send({ message: err.message });
      }
  }

  export const getAllUsers = async (req, res) => {
      try {
      const users = await User.findAll();
      res.status(200).send(users);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  
  }

  export const sendOtp = async () => {
    const {countryCode, phoneNumber} = req.body;
    try {
        const otpResponse = await client.verify
        .services(TWILIO_SERVICE_SID)
        .verifications.create({
            to: `+${countryCode}${phoneNumber}`,
            channel: "sms",
        });
        res.status(200).send(`OTP send successfully!: ${JSON.stringify(otpResponse)}`);
    } catch (error) {
        res.status(error?.status || 400).send(error?.message || 'Something went wrong');
    }
  };

  export const verifyOTP = async (req, res, next) => {
    const {countryCode, phoneNumber, otp} = req.body;
    try {
        const verifiedResponse = await client.verify.services(TWILIO_SERVICE_SID)
        .verificationChecks.create({
            to: `+${countryCode}${phoneNumber}`,
            code: otp
        });
       res.status(200).send(`OTP verified successfully!: ${JSON.stringify(verifiedResponse)}`);
    } catch(error) {
       res.status(error?.status || 400).send(error?.message || `Something went wrong`);
    }
  }
