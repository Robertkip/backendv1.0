import rateLimit from "express-rate-limit";

// Limits guessing on login, signup, OTP and password-reset routes: each
// client IP gets AUTH_RATE_LIMIT_MAX requests (default 20) per route every
// 15 minutes. Behind a reverse proxy, set TRUST_PROXY so the real client IP
// is used (see env.example).
export const createAuthRateLimit = ({ max = Number(process.env.AUTH_RATE_LIMIT_MAX) || 20, windowMs = 15 * 60 * 1000 } = {}) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later." },
  });
