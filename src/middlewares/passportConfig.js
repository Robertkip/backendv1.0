import dotenv from "dotenv";

dotenv.config();

export const facebook = {
  clientId: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: "https://api.waridi.co/api/v1/facebook/callback",
  enableProof: true,
  profileFields: ["id", "emails", "name"],
};

export const google = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://api.waridi.co/api/v1/google/callback",
};
