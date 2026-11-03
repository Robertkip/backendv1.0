import cron from 'node-cron';
import Otp from '../models/otpModel.js';
import { Op } from 'sequelize';
import { logger } from "../config/logger.js";

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const [updated] = await Otp.update(
    { expired: true },
    { where: { expireIn: { [Op.lte]: now }, expired: false } }
  );
  if (updated > 0) logger.info(`Marked ${updated} OTP(s) as expired.`);
});

