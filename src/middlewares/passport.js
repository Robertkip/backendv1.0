import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import passport from "passport";

dotenv.config();

const FACEBOOK_ID = process.env.FACEBOOK_ID;
const FACEBOOK_SECRET = process.env.FACEBOOK_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://api.waridi.org/api/v1/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_ID,
      clientSecret: FACEBOOK_SECRET,
      callbackURL: "https://api.waridi.org/api/v1/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passportSetup;
