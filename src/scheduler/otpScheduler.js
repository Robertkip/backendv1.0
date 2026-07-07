import cron from 'node-cron';
import Otp from '../models/otpModel.js';
import { Op } from 'sequelize';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const [updated] = await Otp.update(
    { expired: true },
    { where: { expireIn: { [Op.lte]: now }, expired: false } }
  );
  if (updated > 0) console.log(`🕒 Marked ${updated} OTP(s) as expired.`);
});

