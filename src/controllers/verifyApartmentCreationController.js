import Otp from "../models/otpModel.js";
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { publishEmailJob } from "../rabbitmq/publisher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({
    email,
    code,
    createdAt: new Date(),
    expireIn: new Date(Date.now() + 5 * 60 * 1000),
  });
  
  const templatePath = path.join(__dirname, '../templates/layouts/welcome.ejs');
  const html = await ejs.renderFile(templatePath, {
    name: req.user?.name || 'User',
    otp: code,
    expiryMinutes: 5,
  });

  await publishEmailJob({
    to: email,
    subject: 'OTP Verification Code',
    html,       
    text: `Your OTP is ${code}`,
  });

  res.status(200).json({ message: 'Verification code sent' });
};


const verifyApartmentCreation = async (req, res) => {
    const { email, code } = req.body;

    try {
        const otp = await Otp.findOne({ email, code });
        if (!otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > otp.expireIn) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        await Otp.destroy({ where: { email, code } });

        res.status(200).json({ message: "Apartment created successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { sendVerificationCode, verifyApartmentCreation };
