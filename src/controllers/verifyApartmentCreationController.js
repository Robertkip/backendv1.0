import Otp from "../models/otpModel.js";
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { publishEmailJob } from "../rabbitmq/publisher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Emails a code to the logged-in user, who confirms the new listing with it.
const sendVerificationCode = async (req, res) => {
  const email = req.user.email;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.destroy({ where: { email, purpose: "apartment_creation" } });
  await Otp.create({
    email,
    code,
    createdAt: new Date(),
    expireIn: new Date(Date.now() + 5 * 60 * 1000),
    purpose: "apartment_creation",
  });

  const templatePath = path.join(__dirname, '../templates/layouts/welcome.ejs');
  const html = await ejs.renderFile(templatePath, {
    name: req.user.username || 'User',
    otp: code,
    expiryMinutes: 5,
  });

  await publishEmailJob({
    to: email,
    subject: 'OTP Verification Code',
    html,
    text: `Your OTP is ${code}`,
  });

  return res.status(200).json({ message: 'Verification code sent' });
};

const verifyApartmentCreation = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "code is required" });
  }

  const where = { email: req.user.email, code: String(code), purpose: "apartment_creation" };
  const otp = await Otp.findOne({ where });
  if (!otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (new Date() > otp.expireIn) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  await Otp.destroy({ where });
  return res.status(200).json({ message: "Apartment created successfully" });
};

export { sendVerificationCode, verifyApartmentCreation };
