import dotenv from 'dotenv';
import twilio from 'twilio';
import jsonwebtoken from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from "../models/authModel.js";
import Config from '../config/authConfig.js';

dotenv.config();

const {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})


export const Signup = (req, res) => {
    try {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const confirm_password = req.body.confirm_password;
  
      if(password !== confirm_password) {
          console.log("Passwords Do not Match")
      } else if(!email || !password || !confirm_password) {
         console.log("Please Provide All Fields")
      } else {
         User.create({
          email: email,
          username: username,
          password: bcryptjs.hashSync(password, 8)
         })
      }
      return res.status(201).send("User Created Successfully"); 
    } catch (err) {
       res.status(500).send({message: err.message});
    }
  }
  
  export const Signin = (req, res) => {
      try {
          User.findOne({
              where: {email: req.body.email}
          }).then(user => {
              if(!user){
                  return res.status(404).send({message: "User not Found."});
              }
  
              let validPassword = bcryptjs.compareSync(
                  req.body.password,
                  user.password
              );
  
              if(!validPassword) {
                  return res.status(401).send({
                      accessToken: null,
                      message: "Invalid Password"
                  });
              }
  
              let token = jsonwebtoken.sign({id: user.id}, Config.secret, {
                  expiresIn: 86400,
              });
              res.status(200).send({
                  id: user.id,
                  email: user.email,
                  password: user.password,
                  accessToken: token
              })
          }) 
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

  
  