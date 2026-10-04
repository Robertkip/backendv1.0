import passport from "passport";
import FacebookStrategy from "passport-facebook";
import GoogleStrategy from "passport-google-oauth20";
import { facebook, google } from "../middlewares/passportConfig.js";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

export const initPassport = (app) => {
  //init's the app session
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SECRET || process.env.REDIS_SESSION_SECRET || "your-secret-here",
    })
  );
  //init passport
  app.use(passport.initialize());
  app.use(passport.session());
};

////////// FACEBOOK //////////
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "https://api.waridi.org/api/v1/google/callback",
//     },
//     facebook,
//     async (accessToken, refreshToken, profile, done) => {
//       console.log(profile);
//       done(null, profile);
//     }
//   )
// );

////////// GOOGLE //////////
// Google sign-in is optional: without credentials the strategy constructor
// throws at import time and the whole server fails to start.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://api.waridi.org/api/v1/google/callback",
      },
      google,
      async (accessToken, refreshToken, profile, done) => {
        //done(err, user) will return the user we got from fb
        done(null, profile);
      }
    )
  );
} else {
  console.warn("GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set, Google sign-in disabled");
}

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));
